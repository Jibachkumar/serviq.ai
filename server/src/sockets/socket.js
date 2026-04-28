import dotenv from "dotenv";
import { Server } from "socket.io";
import logger from "../utils/logger.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";

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

    // 🔥 Ensure session exists
    if (!session) {
      console.log("❌ No session found");
      return socket.disconnect(); // 🔥 stop execution
    }

    // 🔥 Create session ID if not exists
    if (!session.conversationId) {
      session.conversationId = `convo_${Date.now()}_${Math.random()}`;
      session.save(); // 🔥 ensure persistence
    }

    const conversationKey = session.conversationId;

    console.log("Connected:", conversationKey);

    // 🔥 JOIN ROOM
    socket.join(conversationKey);

    // ✅ send message
    socket.on("send-message", async (msg, callback) => {
      try {
        const { text } = msg;
        if (!text) return;
        // 1. get/create conversation
        // let convo = await getOrCreateConversation({
        //   sessionId: conversationKey,
        // });

        console.log(text);

        // 2. save user message
        // await saveMessage({
        //   conversationId: convo._id,
        //   sender: "customer",
        //   content: text,
        // });

        // 3. intent
        // const intent = classifyIntent(text);

        // 4. history
        // const history = await getHistory(convo._id);

        // 5. AI
        // const { reply, state } = await processAI({
        //   text,
        //   history,
        // });

        // 6. update state
        // convo.state = {
        //   ...convo.state,
        //   ...state,
        //   intent,
        // };

        // convo = updateConversationStatus(convo, intent, convo.state);
        // await convo.save();

        // 7. save AI
        // await saveMessage({
        //   conversationId: convo._id,
        //   sender: "ai",
        //   content: reply,
        // });
        // 🔥 PRIVATE RESPONSE
        // io.to(conversationKey).emit("receive-message", {
        //   msg: reply,
        // });
        callback({ success: true });
      } catch (err) {
        console.error(err);
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
