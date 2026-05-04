import { Message } from "../models/message.models.js";

const getHistory = async (conversationId) => {
  const messages = await Message.find({ conversationId }).sort({
    createdAt: 1,
  });

  // Shape history into the format LangGraph messages channel expects
  return messages.map((m) => ({
    sender: m.sender,
    content: m.content,
  }));
};

const saveMessage = async ({ conversationId, sender, content }) => {
  return await Message.create({ conversationId, sender, content });
};

export { getHistory, saveMessage };
