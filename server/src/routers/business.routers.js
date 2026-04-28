import { Router } from "express";
import { validateSchema } from "../middlewares/schemaValidators.js";
import { businessSchema } from "../validators/business.validators.js";
import { createBusiness } from "../controllers/business.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const businessRouter = Router();

businessRouter
  .route("/create-business")
  .post(verifyJWT, validateSchema(businessSchema), createBusiness);

export { businessRouter };
