export const DB_NAME = "serviq";

export const BUSINESS_SERVICE_MAP = {
  ecommerce: ["order"],
  home_services: ["service"],
  travel: ["booking", "rental"],
  rental_booking: ["rental", "booking"],
  food_beverage: ["order"],
  education_training: ["service", "booking"],
  health_wellness: ["service", "booking"],
  pet_services: ["service", "booking"],
  digital_ai_services: ["service"],
  event_services: ["service", "booking"],
  automotive: ["service", "rental"],
  real_estate: ["booking"],
};

export const SERVICE_CONFIG_MAP = {
  rental: {
    fields: [
      { name: "pricePerHour", type: "number" },
      { name: "pricePerDay", type: "number" },
      { name: "securityDeposit", type: "number" },
      { name: "availableUnits", type: "number", required: true },
    ],
  },

  order: {
    fields: [
      { name: "stock", type: "number", required: true },
      { name: "variants", type: "array" },
      { name: "deliveryAvailable", type: "boolean", default: "true" },
    ],
  },

  booking: {
    fields: [
      { name: "durationHours", type: "number", required: true },
      { name: "maxPeople", type: "number", required: true },
      { name: "availableDates", type: "array" },
    ],
  },

  service: {
    fields: [
      { name: "durationHours", type: "number", required: true },
      { name: "location", type: "string", required: true },
    ],
  },
};
