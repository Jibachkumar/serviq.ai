import mongoose, { Schema } from "mongoose";
const messageSchema = new Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
    },
    sender: {
      type: String,
      enum: ["ai", "owner", "user"],
    },
    content: {
      type: mongoose.Schema.Types.Mixed,
    },

    options: [], // for buttons
  },
  { timestamps: true },
);

export const Message = mongoose.model("Message", messageSchema);
