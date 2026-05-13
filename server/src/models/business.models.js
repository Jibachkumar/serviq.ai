import mongoose, { Schema } from "mongoose";
const businessSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    type: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      enum: [
        "rental_booking", // bike, car, camera, equipment etc
        "ecommerce",
        "travel",
        "food_bevarage",
        "Home_services", // cleaning, electrician, plumber, home_repair
        "education_training", // tutor, online_course
        "Health_wellness", // fitnes_trainer, yoga_instructor, therapist, nutritionist
        "pet_service", // pet_grooming, pet_boarding, pet_training, pet_care
        "digital_services", // digital marketing, ai_automation_service, social_media_management, content_creation
        "event_service",
        "automotive",
        "real_estate",
      ],
      required: true,
    },
  },
  { timestamps: true },
);

export const Business = mongoose.model("Business", businessSchema);
