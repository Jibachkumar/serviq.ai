import { listBusinessTypes, listServices } from "../tool/service.tools.js";

export async function toolNode(state) {
  console.log("🔧 Tool node called with intent:", state.intent);
  switch (state.intent) {
    // User is specific — knows what they want
    case "service_query": {
      console.log("🔧 Fetching services...");
      const result = await listServices(state);
      console.log("🔧 Services fetched:", result);
      return {
        data: { services: result.services },
        businessId: result.businessId ?? state.businessId,
        step: "start",
        result: result.result ?? null,
      };
    }

    // User is vague — just browsing
    case "browse_services": {
      const result = await listBusinessTypes();
      return {
        data: { businessTypes: result.businessTypes },
        step: "start",
        result: "Here are available service categories:",
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
