import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Service } from "../models/service.models.js";
import { Business } from "../models/business.models.js";
import logger from "../utils/logger.js";
import { BUSINESS_SERVICE_MAP, SERVICE_CONFIG_MAP } from "../constants.js";
import { uploadOnCloudinary } from "../utils/clodinary.js";

const getServiceOptions = async (req, res, next) => {
  try {
    const { businessId } = req.params;

    const business = await Business.findById(businessId).select("type").lean();

    if (!business) {
      logger.warn("business not found");
      throw new ApiError(404, "Business not found");
    }

    const allowedServices = BUSINESS_SERVICE_MAP[business.type] || [];

    const servicesWithConfig = allowedServices.map((type) => ({
      serviceType: type,
      config: SERVICE_CONFIG_MAP[type] || {},
    }));

    logger.info("Successfully generated service options");

    return res.status(200).json({
      businessType: business.type,
      services: servicesWithConfig,
    });
  } catch (error) {
    logger.error(`Error in getServiceOptions: ${error.message}`);
    next(error);
  }
};

const createService = async (req, res, next) => {
  try {
    const { name, description, basePrice, serviceType, config } = req.body;
    const { businessId } = req.params; // ✅ from URL

    // ✅ validation
    // ✅ auth check
    if (!req.user?._id) {
      logger.warn("Unauthorized access attempt");
      throw new ApiError(401, "Unauthorized user");
    }

    // ✅ handle multiple images
    const productImage = req.files?.images;

    if (!productImage) {
      logger.warn("Product creation missing product image");
      throw new ApiError(400, "product image file is required");
    }

    const imageLocalPath = [];
    for (const file of productImage) {
      const uploadedImage = await uploadOnCloudinary(file.path);

      imageLocalPath.push({ url: uploadedImage.url });
    }

    // ✅ check business exists and belongs to user
    const business = await Business.findById(businessId).select("ownerId type");

    if (!business) {
      logger.warn("business not found");
      throw new ApiError(404, "Business not found");
    }

    if (business.ownerId.toString() !== req.user._id.toString()) {
      logger.warn("Unauthorized service creation attempt");
      throw new ApiError(
        403,
        "You are not allowed to add services to this business",
      );
    }

    // 🔥 enforce allowed service types
    const allowed = BUSINESS_SERVICE_MAP[business.type] || [];

    if (!allowed.includes(serviceType)) {
      logger.warn("wrong service type you define based on your business");
      throw new ApiError(
        400,
        `Service '${serviceType}' not allowed for '${business.type}'`,
      );
    }

    // ✅ create service
    const service = await Service.create({
      name,
      businessId,
      description,
      basePrice,
      serviceType,
      images: imageLocalPath,
      config,
    });

    logger.info(`Service created: ${service._id}`);

    return res
      .status(201)
      .json(new ApiResponse(201, service, "Service created successfully"));
  } catch (error) {
    logger.error(`Error in createService controller: ${error.message}`);
    next(error);
  }
};

export { createService, getServiceOptions };
