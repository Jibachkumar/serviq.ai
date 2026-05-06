import dotenv from "dotenv";
import { Server } from "socket.io";
import logger from "../utils/logger.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { runGraph } from "../core/langgraph.runner.js";
import { getHistory, saveMessage } from "../controllers/message.controllers.js";
import { getOrCreateConversation } from "../controllers/conversation.controllers.js";
import { Conversation } from "../models/conversation.model.js";
import { createCustomer } from "../controllers/customer.controllers.js";

dotenv.config({
  path: "./.env",
});

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

    let cachedConversation = null;
    let cachedHistory = [];

    // ✅ check for actual value
    if (clientConvoId && clientConvoId !== "") {
      const exists = await Conversation.findOne({ sessionId: clientConvoId });
      if (exists) {
        session.conversationId = clientConvoId;
        session.save();
        cachedConversation = exists;
        cachedHistory = await getHistory(exists._id);
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
    socket.emit("message-history", { messages: cachedHistory });

    if (!cachedHistory || cachedHistory.length === 0) {
      socket.emit("receive-message", {
        msg: "Hi! What service do you need today?",
        isWelcome: true,
      });
    }

    // 🔥 JOIN ROOM
    socket.join(conversationKey);

    // ✅ send message
    socket.on("send-message", async (msg, callback) => {
      try {
        const { text } = msg;
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
          content: text,
        });

        // 3. Add to history cache — AI needs current message for context
        cachedHistory.push({ sender: "user", content: text });

        // 4. Run LangGraph
        //    - text       : latest user message
        //    - history    : full message history so AI has context
        //    - state      : current flow/step/data/intent from conversation
        //                   so AI knows where the user left off (e.g. mid-booking)
        const result = await runGraph({
          text,
          history: cachedHistory,
          state: cachedConversation.state,
        });

        // 5. Save AI reply
        await saveMessage({
          conversationId: cachedConversation._id,
          sender: "ai",
          content: result.result,
        });

        // 6. Add AI reply to history cache
        cachedHistory.push({ sender: "ai", content: result.result });

        // 7. Update conversation state with whatever LangGraph returned
        //    This persists intent/flow/step/data for the next turn
        const newState = {
          intent: result.intent,
          flow: result.flow,
          step: result.step,
          data: result.data,
        };

        // 8. Update in-memory cache with new state
        cachedConversation.state = newState;

        // 9. Build DB update object using newState directly
        const dbUpdate = { state: newState };

        // 10. Attach businessId if AI matched a business for first time
        if (result.businessId && !cachedConversation.businessId) {
          dbUpdate.businessId = result.businessId;
          cachedConversation.businessId = result.businessId; // ✅ update cache too
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
          msg: result.result,
        });
      } catch (err) {
        console.error(err);
        socket.emit("message-error", {
          msg: "Something went wrong. Please try again.",
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
