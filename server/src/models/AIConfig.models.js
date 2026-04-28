import mongoose, { Schema } from "mongoose";
const agentSchema = new Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
    },
    prompt: {
      type: String,
      required: true,
    },
    tone: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      default: "en",
    },
    enabledFeatures: [], // ["booking", "recommendation"]
  },
  { timestamps: true },
);

export const Agent = mongoose.model("Agent", agentSchema);
