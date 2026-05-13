import dotenv from "dotenv";
import { Server } from "socket.io";
import logger from "../utils/logger.js";
import { runGraph } from "../core/langgraph.runner.js";
import { getHistory, saveMessage } from "../controllers/message.controllers.js";
import { getOrCreateConversation } from "../controllers/conversation.controllers.js";
import { Conversation } from "../models/conversation.model.js";
import { createCustomer } from "../controllers/customer.controllers.js";
import { Agent } from "../models/AIConfig.models.js";
import { Tool } from "../models/tool.models.js";

dotenv.config({
  path: "./.env",
});

const HISTORY_DISPLAY_LIMIT = 10;

const socket = (server, sessionMiddleware) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN,
      credentials: true,
    },
  });

  /* 🔥 SHARE SESSION WITH SOCKET */
  io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next);
  });

  io.on("connection", async (socket) => {
    const session = socket.request.session;
    const clientConvoId = socket.handshake.query.conversationId;

    // 🔥 Ensure session exists
    if (!session) {
      console.log("❌ No session found");
      return socket.disconnect(); // 🔥 stop execution
    }

    // ✅ Per-connection cache — not shared across users
    let cachedConversation = null;
    let cachedHistory = [];
    let cachedAgent = null;
    let cachedTools = [];

    // ─── Load business own agent, tool config lazily
    const loadAgentConfig = async (businessId) => {
      if (!businessId) return;
      const [agent, tools] = await Promise.all([
        Agent.findOne({ businessId }),
        Tool.find({ businessId, enabled: true }),
      ]);
      cachedAgent = agent;
      cachedTools = tools.map((t) => t.name); // ["checkAvailability", "createBooking"]
    };

    // ✅ check for actual value
    if (clientConvoId && clientConvoId !== "") {
      const exists = await Conversation.findOne({ sessionId: clientConvoId });
      if (exists) {
        session.conversationId = clientConvoId;
        session.save();
        cachedConversation = exists;
        cachedHistory = await getHistory(exists._id);

        // ✅ If this conversation already has a businessId — load agent now
        // Returning user — we already know their business
        if (exists.businessId) {
          await loadAgentConfig(exists.businessId);
        }
      } else {
        // ID not in DB — treat as new guest
        session.conversationId = `convo_${Date.now()}_${Math.random()}`;
        session.save();
      }
    } else {
      if (!session.conversationId) {
        session.conversationId = `convo_${Date.now()}_${Math.random()}`;
        session.save();
      }
    }

    const conversationKey = session.conversationId;
    socket.emit("session", { conversationId: conversationKey });
    console.log("Connected:", conversationKey);

    // Send history if exists
    // Send paginated history on connect (most recent page)
    const totalMessages = cachedHistory.length;
    const initialHistory = cachedHistory.slice(-HISTORY_DISPLAY_LIMIT);
    socket.emit("message-history", {
      messages: initialHistory,
      pagination: {
        page: 1,
        totalPages: Math.ceil(totalMessages / HISTORY_DISPLAY_LIMIT),
        totalMessages,
        hasMore: totalMessages > HISTORY_DISPLAY_LIMIT,
      },
    });

    if (!cachedHistory || cachedHistory.length === 0) {
      socket.emit("receive-message", {
        payload: {
          type: "text",
          message: "Welcome to the serviq. What service do you need today?",
        },
        isWelcome: true,
      });
    }

    // 🔥 JOIN ROOM
    socket.join(conversationKey);

    // ✅ send message
    socket.on("send-message", async (msg, callback) => {
      try {
        const { text, page = 1 } = msg;
        if (!text) {
          return callback({ success: false, error: "Empty message" });
        }

        console.log(text);
        callback({ success: true });

        //1. Create conversation only on first message
        if (!cachedConversation) {
          cachedConversation = await getOrCreateConversation({
            sessionId: conversationKey,
            channel: "web",
          });
        }

        // 2. save user message
        await saveMessage({
          conversationId: cachedConversation._id,
          sender: "user",
          content: {
            type: "text",
            message: text,
          },
        });

        // 3. Run LangGraph
        //    - text       : latest user message
        //    - history    : full message history so AI has context
        //    - state      : current flow/step/data/intent from conversation
        //                   so AI knows where the user left off (e.g. mid-booking)
        // agent           : each business has each prompt, tone,
        //  tools          : each business has its own feature
        const result = await runGraph({
          text,
          history: cachedHistory,
          state: cachedConversation.state,
          agent: cachedAgent,
          tools: cachedTools,
          page,
        });
        console.log(result);

        // 4. Add to history cache — AI needs current message for context
        cachedHistory.push({
          sender: "user",
          content: {
            type: "text",
            message: text,
          },
        });

        // 5. Save AI reply
        if (result.result) {
          await saveMessage({
            conversationId: cachedConversation._id,
            sender: "ai",
            content: result.result,
          });
          // 6. Add AI reply to history cache
          cachedHistory.push({ sender: "ai", content: result.result });
        }

        // 7. Update conversation state with whatever LangGraph returned
        //    This persists intent/flow/step/data for the next turn

        // ✅ Only allow known values — strip anything the model invented
        const VALID_FLOWS = ["none", "booking", "order", "rental", "inquiry"];
        const VALID_STEPS = ["start", "collecting_details", "confirmed"];

        // ✅ These are turn-level only — never save businessTypes, services only save customer data to DB
        const { businessTypes, categories, providers, ...persistentData } =
          result.data ?? {};

        const newState = {
          intent: result.intent,
          flow:
            result.intent === "greeting"
              ? "none"
              : VALID_FLOWS.includes(result.flow)
                ? result.flow
                : "none",
          step:
            result.intent === "greeting"
              ? "start"
              : VALID_STEPS.includes(result.step)
                ? result.step
                : "start",
          data: persistentData,
        };

        // 8. Update in-memory cache with new state
        cachedConversation.state = newState;

        // 9. Build DB update object using newState directly
        const dbUpdate = { state: newState };

        // 10. Attach businessId if AI matched a business for first time
        if (result.businessId && !cachedConversation.businessId) {
          dbUpdate.businessId = result.businessId;
          cachedConversation.businessId = result.businessId; // ✅ update cache too

          await loadAgentConfig(result.businessId);
        }

        // 11. If booking confirmed — create customer and reset state
        if (result.flow === "booking" && result.step === "confirmed") {
          const customer = await createCustomer(result);

          // Attach customerId to conversation
          dbUpdate.customerId = customer._id;

          //  If booking flow just completed, clear the scratchpad data
          const resetState = {
            intent: result.intent,
            flow: "none",
            step: "start",
            data: {},
          };
          dbUpdate.state = resetState; // ✅ DB gets reset state
          cachedConversation.state = resetState; // ✅ cache gets reset state
        }

        // 12. update and save to DB
        await Conversation.findByIdAndUpdate(cachedConversation._id, dbUpdate);

        // 13. Send reply to user
        io.to(conversationKey).emit("receive-message", {
          payload: result.result,
          pagination: result.pagination,
        });
      } catch (err) {
        console.error(err);
        socket.emit("message-error", {
          payload: {
            type: "error",
            message: "Something went wrong. Please try again.",
          },
        });
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      logger.info("Disconnected:", conversationKey);
    });
  });

  return io;
};

export { socket };

/*
  --------multi business agent, tool loading flow-------
  // AI just returned a businessId for the first time
  // Load agent + tools NOW so next message uses them
  
  First message
  └── agent = null, tools = []
  └── PLATFORM_PROMPT fires
  └── AI finds matching business
  └── returns businessId
  └── loadAgentConfig(businessId) runs

Second message onwards
  └── agent = { prompt, tone }
  └── tools = ["createBooking", ...]
  └── BUSINESS_PROMPT fires
  └── Full business AI with personality + tools
*/
