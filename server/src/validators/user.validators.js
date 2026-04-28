import Joi from "joi";

const username = Joi.string()
  .pattern(/^[a-zA-Z]+(?: [a-zA-Z]+)+$/)
  .min(10)
  .max(50)
  .required()
  .messages({
    "string.pattern.base":
      "Username must contain only first and last name separated by spaces",
    "string.min": "Username must be at least 10 characters",
    "string.max": "Username must be at most 50 characters",
    "any.required": "Username is required",
  });

const email = Joi.string()
  .email()
  .required()
  .pattern(/^(?=.*[0-9])[a-zA-Z0-9._%+-]/)
  .messages({
    "string.email": "Please provide a valid email",
    "string.pattern.base":
      "Email must be a Gmail address and contain at least one number",
    "any.required": "Email is required",
  });

const address = Joi.string().min(3).max(50).required().messages({
  "string.min": "Address must be at least 3 characters long",
  "string.max": "Address must be at most 50 characters long",
  "any.required": "Address is required",
});

const password = Joi.string()
  .pattern(/^[a-zA-Z0-9]{4,20}$/)
  .required()
  .messages({
    "string.pattern.base":
      "Password must be 4-20 characters and also be alphanumeric",
    "any.required": "Password is required",
  });

const phoneNumber = Joi.number()
  .integer()
  .min(1000000000)
  .max(9999999999)
  .required()
  .messages({
    "number.base": "Phone number must be exactly 10 digits",
    "number.min": "Phone number must be exactly 10 digits",
    "number.max": "Phone number must be exactly 10 digits",
  });

const role = Joi.string().optional();

const registerSchema = Joi.object({
  username,
  email,
  address,
  phoneNumber,
  password,
  role,
});

const loginSchema = Joi.object({
  email,
  password,
});

export { registerSchema, loginSchema };
