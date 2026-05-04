import { Conversation } from "../models/conversation.model.js";

const getOrCreateConversation = async ({ sessionId, channel }) => {
  let conversation = await Conversation.findOne({ sessionId });

  if (!conversation) {
    conversation = await Conversation.create({
      sessionId,
      channel,
    });
  }

  return conversation;
};

export { getOrCreateConversation };
