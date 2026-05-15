import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Business } from "../models/business.models.js";
import logger from "../utils/logger.js";
import { seedTools } from "./tool.controllers.js";

const createBusiness = async (req, res, next) => {
  try {
    const { name, type } = req.body;

    // ✅ auth check
    if (!req.user?._id) {
      logger.warn("Unauthorized access attempt");
      throw new ApiError(401, "Unauthorized user");
    }

    // create business
    const business = await Business.create({
      name,
      type,
      ownerId: req.user._id,
    });

    // Seed all tools for this business (all disabled by default)
    await seedTools(business._id);

    logger.info(`Business created sucessfully`);

    return res
      .status(201)
      .json(new ApiResponse(201, business, "Business created successfully"));
  } catch (error) {
    logger.error(`Error in createBusiness controller: ${error.message}`);
    next(error);
  }
};

export { createBusiness };
