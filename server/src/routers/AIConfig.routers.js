import { Router } from "express";
import { verifyBusiness } from "../middlewares/auth.middlewares.js";
import { upsertAgent } from "../controllers/AIConfig.controllers.js";

const agentRouter = Router();

agentRouter.route("/create-prompt").post(verifyBusiness, upsertAgent);

export { agentRouter };
