import mongoose, { Schema } from "mongoose";

const bookingSchema = new Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
    notes: {
      type: String, // ← NEW: any special requests from customer
      // why: customers often have requirements ("ground floor please")
    },
    totalPrice: {
      type: Number, // ← NEW: snapshot of price at booking time
      // why: service basePrice might change later, booking should preserve what was charged
    },
    cancelledAt: {
      type: Date, // ← NEW: when was it cancelled
      // why: useful for analytics and refund windows
    },
    cancelReason: {
      type: String, // ← NEW: why was it cancelled
      // why: business needs to know, also helps AI answer customer questions
    },
    timeSlot: {
      type: String, // ← NEW: "10:00 AM - 11:00 AM"
      // why: date alone doesn't tell you when in the day
      // checkAvailability needs this to detect clashes
    },
  },
  { timestamps: true },
);

export const Booking = mongoose.model("Booking", bookingSchema);
