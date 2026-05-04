// tools/service.tool.js
import { Business } from "../../models/business.models.js";
import { Service } from "../../models/service.models.js";

async function listBusinessTypes() {
  // Only return types that actually have businesses registered
  // and have at least one available service — no empty categories
  const types = await Business.aggregate([
    {
      $lookup: {
        from: "services",
        localField: "_id",
        foreignField: "businessId",
        as: "services",
      },
    },
    {
      $match: {
        "services.isAvailable": true,
      },
    },
    {
      $group: {
        _id: "$type",
      },
    },
    {
      $project: {
        _id: 0,
        type: "$_id",
      },
    },
  ]);

  return {
    businessTypes: types.map((t) => t.type),
    // e.g ["Home_services", "education_training", "automotive"]
  };
}

async function listServices(state) {
  const { context } = state;

  // Find all businesses matching the detected business type
  const businesses = await Business.find({
    type: context.businessType,
  }).select("_id name description");

  if (businesses.length === 0) {
    return {
      services: [],
      result: `No businesses found for ${context.businessType}.`,
    };
  }

  const businessIds = businesses.map((b) => b._id);

  // Find all available services under those businesses
  const services = await Service.find({
    businessId: { $in: businessIds },
    isAvailable: true,
  })
    .populate("businessId", "name type description")
    .select("name description basePrice serviceType config")
    .limit(5);

  if (services.length === 0) {
    return {
      services: [],
      result: `No services currently available for ${context.businessType}.`,
    };
  }

  const shaped = services.map((s) => ({
    id: s._id,
    name: s.name,
    description: s.description,
    basePrice: s.basePrice,
    serviceType: s.serviceType,
    config: s.config,
    business: {
      id: s.businessId._id,
      name: s.businessId.name,
      type: s.businessId.type,
      description: s.businessId.description,
    },
  }));

  return {
    services: shaped,
    businessId: shaped[0].business.id,
  };
}

export { listBusinessTypes, listServices };
