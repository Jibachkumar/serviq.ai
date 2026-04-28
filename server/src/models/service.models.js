import mongoose, { Schema } from "mongoose";

const serviceSchema = new Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
    },
    images: [
      {
        url: {
          type: String,
          _id: false,
        },
      },
    ],
    basePrice: {
      type: Number,
      required: true,
    },
    serviceType: {
      type: String,
      enum: ["rental", "order", "booking", "service"],
      required: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    config: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true },
);

const SERVICE_ALLOWED_FIELDS = {
  rental: ["pricePerHour", "pricePerDay", "securityDeposit", "availableUnits"],
  order: ["stock", "variants", "deliveryAvailable"],
  booking: ["durationHours", "maxPeople", "availableDates"],
  service: ["durationHours", "maxPeople", "location", "availableDates"],
};

// 🔥 reusable function (used in both middlewares)
function clearConfig(serviceType, config = {}) {
  const allowedFields = SERVICE_ALLOWED_FIELDS[serviceType] || [];
  const cleaned = {};

  for (const key of allowedFields) {
    if (config[key] !== undefined) {
      cleaned[key] = config[key];
    }
  }

  return cleaned;
}

// ✅ 1. Handle CREATE / SAVE
serviceSchema.pre("save", function () {
  this.config = clearConfig(this.serviceType, this.config);
});

// ✅ 2. Handle UPDATE (findByIdAndUpdate, etc.)
serviceSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();

  let config = update.config || update.$set?.config;
  let serviceType = update.serviceType || update.$set?.serviceType;

  // get existing type if not provided
  if (!serviceType) {
    const doc = await this.model.findOne(this.getQuery());
    if (doc) serviceType = doc.serviceType;
  }

  if (!config || !serviceType) return next();

  const cleaned = clearConfig(serviceType, config);

  if (update.config) update.config = cleaned;
  if (update.$set?.config) update.$set.config = cleaned;

  next();
});

export const Service = mongoose.model("Service", serviceSchema);
