import mongoose, { Schema } from "mongoose";
const subscriptionSchema = new Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    plan: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    bilingCycle: {
      type: Date,
    },
  },
  { timestamps: true },
);

export const Subscription = mongoose.model("Subscription", subscriptionSchema);
