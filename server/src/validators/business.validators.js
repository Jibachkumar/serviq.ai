import Joi from "joi";

const businessSchema = Joi.object({
  name: Joi.string().trim().required().messages({
    "string.base": "name must be a string",
    "string.empty": "name cannot be empty",
    "any.required": "name is required",
  }),

  type: Joi.string()
    .valid("travel", "shop", "ecommerce", "rental")
    .required()
    .messages({
      "any.only": "type must be travel, shop, rental, or ecommerce",
      "any.required": "type is required",
    }),
});

export { businessSchema };
