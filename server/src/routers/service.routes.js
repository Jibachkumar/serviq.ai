import { Router } from "express";
import { validateSchema } from "../middlewares/schemaValidators.js";
import { serviceSchema } from "../validators/service.validators.js";
import {
  createService,
  getServiceOptions,
} from "../controllers/service.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { parseConfig } from "../middlewares/parseConfig.middlewares.js";

const serviceRouter = Router();

serviceRouter.use(verifyJWT);

serviceRouter.route("/:businessId/service-options").get(getServiceOptions);

serviceRouter
  .route("/:businessId/service")
  .post(
    upload.fields([{ name: "images", maxCount: 4 }]),
    parseConfig,
    validateSchema(serviceSchema),
    createService,
  );

export { serviceRouter };
