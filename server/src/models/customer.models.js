import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/apiError.js";
const customerSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String, // ← NEW: was in token but missing from schema
      sparse: true, // allows null but unique when set
      unique: true,
      lowercase: true,
    },
    phoneNumber: {
      type: Number,
      required: true,
      unique: true,
    },
    address: {
      type: String,
    },
    conversationId: {
      type: String, // ← NEW: link back to their chat session
      // why: lets you pull booking history from a returning customer's chat
    },
  },
  { timestamps: true },
);
export const Customer = mongoose.model("Customer", customerSchema);
