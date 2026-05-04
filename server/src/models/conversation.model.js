import mongoose, { Schema } from "mongoose";
const conversationSchema = new Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
    },
    sessionId: {
      type: String,
    },
    channel: {
      type: String,
    },
    status: {
      type: String,
      enum: ["active", "closed"], // track the previous message
      default: "active",
    },
    state: {
      intent: String,

      // what type of flow user is in
      flow: {
        type: String,
        enum: ["none", "booking", "order", "rental", "inquiry"],
        default: "none",
      },

      step: {
        type: String,
        default: "start",
      },

      // 🔥 dynamic payload (important)
      data: {
        type: Schema.Types.Mixed, // flexible object
        default: {},
      },

      // optional metadata
      context: {
        businessType: String,
        language: String,
      },
    },
  },
  { timestamps: true },
);

export const Conversation = mongoose.model("Conversation", conversationSchema);
