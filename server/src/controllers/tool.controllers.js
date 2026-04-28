import { DynamicTool } from "langchain/tools";
import { Service } from "../models/service.model.js";
import { Booking } from "../models/booking.model.js";

// 🔍 Search Services
export const searchServicesTool = new DynamicTool({
  name: "search_services",
  description: "Find services based on type, location, and price",
  func: async (input) => {
    const { location } = JSON.parse(input);

    const services = await Service.find({
      type: serviceType,
      ...(location && { location }),
      ...(maxPrice && { price: { $lte: maxPrice } }),
    })
      .limit(5)
      .lean();

    return JSON.stringify(services);
  },
});

// 📅 Create Booking
export const createBookingTool = new DynamicTool({
  name: "create_booking",
  description: "Create a booking for a service",
  func: async (input) => {
    const data = JSON.parse(input);
    const booking = await Booking.create(data);

    return JSON.stringify({
      success: true,
      bookingId: booking._id,
    });
  },
});
