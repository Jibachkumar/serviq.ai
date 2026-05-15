import { Tool } from "../models/tool.models.js";

/*
NOTE: 
 Here's the key design decision — instead of creating tools one by one, you seed all available 
 tools for a business when they onboard, then toggle them on/off.
*/

// All tools your platform supports
const AVAILABLE_TOOLS = [
  "checkAvailability",
  "createBooking",
  "cancelBooking",
  "getBusinessInfo",
];

// Seed all tools for a new business (call this when business is created)
export async function seedTools(businessId) {
  const existing = await Tool.find({ businessId });
  const existingNames = existing.map((t) => t.name);

  const toInsert = AVAILABLE_TOOLS.filter(
    (name) => !existingNames.includes(name),
  ).map((name) => ({
    businessId,
    name,
    enabled: false, // off by default
  }));

  if (toInsert.length > 0) {
    await Tool.insertMany(toInsert);
  }
}

// Toggle a single tool on or off
export async function toggleTool(req, res) {
  try {
    const businessId = req.business._id;
    const { name, enabled } = req.body;

    const tool = await Tool.findOneAndUpdate(
      { businessId, name },
      { enabled },
      { new: true },
    );

    if (!tool) throw new ApiError(404, "Tool not found");

    res.status(200).json({ success: true, tool });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
}

// Get all tools for a business
export async function getTools(req, res) {
  try {
    const businessId = req.business._id;
    const tools = await Tool.find({ businessId });

    res.status(200).json({ success: true, tools });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
}

// Bulk update — toggle multiple tools at once
export async function bulkUpdateTools(req, res) {
  try {
    const businessId = req.business._id;
    const { tools } = req.body;
    // tools = [{ name: "createBooking", enabled: true }, ...]

    const updates = tools.map(({ name, enabled }) =>
      Tool.findOneAndUpdate({ businessId, name }, { enabled }, { new: true }),
    );

    const updated = await Promise.all(updates);

    res.status(200).json({ success: true, tools: updated });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
}
