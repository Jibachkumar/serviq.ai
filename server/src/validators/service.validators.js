import Joi from "joi";
const name = Joi.string().required().messages({
  "string.base": "name must be a string",
  "string.empty": "name cannot be empty",
  "any.required": "name is required",
});

const description = Joi.string().optional();

const basePrice = Joi.number().required().messages({
  "any.required": "basePrice is required",
});

const serviceType = Joi.string()
  .valid("rental", "order", "booking", "service")
  .required()
  .messages({
    "any.only": "type must be rental, order, booking, or service",
    "any.required": "type is required",
  });

const configSchemas = {
  rental: Joi.object({
    pricePerHour: Joi.number(),
    pricePerDay: Joi.number(),
    securityDeposit: Joi.number(),
    availableUnits: Joi.number().required(),
  }).or("pricePerHour", "pricePerDay"),

  order: Joi.object({
    stock: Joi.number().required(),
    variants: Joi.array().items(Joi.string()),
    deliveryAvailable: Joi.boolean(),
  }),

  booking: Joi.object({
    durationHours: Joi.number().required(),
    maxPeople: Joi.number().required(),
    availableDates: Joi.array().items(Joi.date()),
  }),

  service: Joi.object({
    durationHours: Joi.number().required(),
    location: Joi.string().required(),
  }),
};

const serviceSchema = Joi.object({
  name,
  basePrice,
  description,
  serviceType,
  config: Joi.when("serviceType", {
    switch: [
      { is: "rental", then: configSchemas.rental.required() },
      { is: "order", then: configSchemas.order.required() },
      { is: "booking", then: configSchemas.booking.required() },
      { is: "service", then: configSchemas.service.required() },
    ],
    otherwise: Joi.forbidden(),
  }),
});

export { serviceSchema };
