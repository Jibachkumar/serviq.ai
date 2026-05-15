import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";
import logger from "../utils/logger.js";
import { Business } from "../models/business.models.js";

const verifyJWT = async (req, _, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer", "");

    if (!token) {
      logger.warn("Unauthorized request: No access token provided");
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken._id).select(
      "-password -refreshToken",
    );

    if (!user) {
      logger.warn("Unauthorized request: Invalid access token");
      throw new ApiError(401, "Invalid access token");
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error("Error in verifying JWT", { error: error.message });
    next(error);
  }
};

// For routes that need the business attached (owner-only actions)
async function verifyBusiness(req, res, next) {
  try {
    const token =
      req.cookies?.accessToken ||
      req.headers?.authorization?.replace("Bearer ", "");

    if (!token) throw new ApiError(401, "Unauthorized");

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const business = await Business.findOne({ ownerId: decoded._id });

    if (!business) throw new ApiError(404, "Business not found");

    req.business = business;
    next();
  } catch (error) {
    logger.error("Error in verifyBusiness JWT", { error: error.message });
    next(error);
  }
}

export { verifyJWT, verifyBusiness };
