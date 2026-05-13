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

function normalizeType(str) {
  return str?.trim().toLowerCase().replace(/\s+/g, "_");
}

async function listServiceCategories(state) {
  const { context } = state;
  console.log(context);

  // normalize — "home service" → "Home_services"
  const businessType = normalizeType(context.businessType);

  // Get distinct categories under this business type
  const businesses = await Business.find({
    type: { $regex: new RegExp(`^${businessType}$`, "i") },
  }).select("_id");

  const businessIds = businesses.map((b) => b._id);

  const categories = await Service.find({
    businessId: { $in: businessIds },
  }).select("name _id");

  return {
    categories: categories.map((c) => c.name),
  };
}

async function listServices(state) {
  const { context } = state;
  console.log(context);

  let providers;

  if (context.serviceQuery) {
    const query = context.serviceQuery
      .trim()
      .replace(/^(a|an|the|some|i want|i need|give me|find me)\s+/i, "")
      .trim();
    // User was specific → search directly by service name
    providers = await Service.find({
      name: { $regex: new RegExp(query, "i") },
      isAvailable: true,
    })
      .populate("businessId", "type") // get business info too
      .limit(10);
  } else if (context.businessType) {
    // User was broad → find businesses of that type, then their services
    const businessType = normalizeType(context.businessType);

    const businesses = await Business.find({
      type: { $regex: new RegExp(`^${businessType}$`, "i") },
    }).select("_id");

    const businessIds = businesses.map((b) => b._id);

    providers = await Service.find({
      businessId: { $in: businessIds },
      isAvailable: true,
    }).limit(10);
  }

  if (!providers?.length) {
    return {
      services: [],
      result: `No services currently available for ${context.businessType}.`,
    };
  }

  const shaped = providers.map((s) => ({
    name: s.name,
    description: s.description,
    basePrice: s.basePrice,
    serviceType: s.serviceType,
    ...s.config,
  }));

  return {
    providers: shaped,
    businessId: providers[0].businessId,
  };
}

export { listBusinessTypes, listServices, listServiceCategories };
