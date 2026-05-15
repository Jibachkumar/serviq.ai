import { Agent } from "../models/AIConfig.models.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import logger from "../utils/logger.js";

// Create or update agent config for a business
async function upsertAgent(req, res) {
  try {
    const { prompt, tone, language } = req.body;

    if (!req.business?._id) {
      logger.warn("Unauthorized access attempt");
      throw new ApiError(401, "Unauthorized user");
    }

    if (!prompt || !tone) {
      throw new ApiError(400, " prompt and tone are required");
    }

    const agent = await Agent.findOneAndUpdate(
      { businessId: business._id },
      { prompt, tone, language },
      { upsert: true, new: true }, // ← upsert: true means "create if not found"
    );

    return res
      .status(201)
      .json(new ApiResponse(201, agent, "Agent created/updated successfully"));
  } catch (error) {
    logger.error("Error in upsertAgent controller", { error: error.message });
    next(error);
  }
}

// Get agent config for a business
async function getAgent(req, res) {
  try {
    const { businessId } = req.params;
    const agent = await Agent.findOne({ businessId });

    if (!agent) throw new ApiError(404, "Agent not found");

    return res
      .status(200)
      .json(new ApiResponse(200, agent, "successfully get Agent"));
  } catch (error) {
    logger.error("Error in getAgent controller", { error: error.message });
    next(error);
  }
}

export { upsertAgent, getAgent };
