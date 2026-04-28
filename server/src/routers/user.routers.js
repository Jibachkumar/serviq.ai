import { Router } from "express";
import { registerUser, loginUser } from "../controllers/user.controllers.js";
import { loginSchema, registerSchema } from "../validators/user.validators.js";
import { validateSchema } from "../middlewares/schemaValidators.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const userRouter = Router();

userRouter
  .route("/register")
  .post(validateSchema(registerSchema), registerUser);
userRouter.route("/login").post(validateSchema(loginSchema), loginUser);

export { userRouter };
