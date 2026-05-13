import {
  listBusinessTypes,
  listServices,
  listServiceCategories,
} from "../tool/service.tools.js";

export async function toolNode(state) {
  console.log("🔧 Tool node called with intent:", state.intent);
  switch (state.intent) {
    // User is vague — just browsing
    case "browse_services":
    case "greeting": {
      const result = await listBusinessTypes();
      console.log("🔧 browse_service:", result);
      return {
        data: { businessTypes: result.businessTypes },
        toolCalled: true,
        step: "start",
      };
    }

    // User is specific — knows what they want
    case "service_query": {
      if (state.context.serviceQuery) {
        console.log("🔧 Fetching service providers");
        const result = await listServices(state);
        console.log("🔧 Services fetched:", result);
        return {
          data: { providers: result.providers },
          toolCalled: true,
          businessId: result.businessId ?? state.businessId,
          step: "start",
        };
      }

      console.log("🔧 Fetching service categories...");
      const result = await listServiceCategories(state);
      console.log("🔧 Categories fetched:", result);
      return {
        data: { categories: result.categories },
        toolCalled: true,
        step: "start",
        // businessId: result.businessId ?? state.businessId,
      };
    }

    case "booking": {
      // ← clear businessTypes and services from data
      // keep only what user has provided so far
      const cleanData = { ...state.data };
      delete cleanData.businessTypes;
      delete cleanData.services;

      const booking = await createBooking({
        ...state,
        data: cleanData,
      });
      return {
        result: booking,
        flow: "none", // booking done, reset flow
        step: "start",
        data: {}, // clear scratchpad
      };
    }

    default:
      return { step: "start" };
  }
}
