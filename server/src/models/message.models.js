import mongoose, { Schema } from "mongoose";
const messageSchema = new Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
    },
    sender: {
      type: String,
      emun: ["ai", "owner", "customer"],
    },
    content: {
      type: String,
    },
    options: [], // for buttons
  },
  { timestamps: true },
);

export const Message = mongoose.model("Message", messageSchema);
