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
    channel: {
      type: String,
    },
    status: {
      type: String,
      enum: ["active", "closed"], // track the previous mwssage
      default: "active",
    },
  },
  { timestamps: true },
);

export const Converation = mongoose.model("conversation", conversationSchema);
