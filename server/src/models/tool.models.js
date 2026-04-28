import mongoose, { Schema } from "mongoose";
const toolSchema = new Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
    },
    name: {
      type: String,
      required: true, // ((checkAvailability, createBooking))
    },
    enabled: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true },
);

export const Tool = mongoose.model("Tool", toolSchema);
