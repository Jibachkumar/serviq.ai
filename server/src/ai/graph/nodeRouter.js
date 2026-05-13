export function router(state) {
  console.log("🔀 Router called with:", {
    intent: state.intent,
    step: state.step,
    hasBusinessTypes: !!state.data?.businessTypes,
    hasCategories: !!state.data?.categories,
    hasProviders: !!state.data?.providers,
  });

  const directResponseIntents = ["unknown", "complaint", "cancellation"];

  if (directResponseIntents.includes(state.intent)) {
    return "response";
  }

  if (state.intent === "browse_services" || state.intent === "greeting") {
    if (!state.toolCalled) {
      console.log("✅ Routing to TOOL: browse_services");
      return "tool";
    }

    // return "end";
  }

  if (state.intent === "service_query") {
    if (!state.toolCalled) {
      console.log("✅ Routing to TOOL: service_query");
      return "tool";
    }
    // return "end";
  }

  // still collecting details → end this turn, wait for next user message
  if (state.intent === "booking" && state.step === "collecting_details") {
    return "end";
  }

  // Booking execution only when confirmed
  // all data collected → execute booking/order/rental
  if (state.intent === "booking" && state.step === "confirmed") {
    return "tool";
  }

  console.log("⚠️ Falling through to END");
  return "response";
}
/*
aiNode → router → toolNode → responseNode → END

So your tools will be real functions like:
listServices({ businessType })     → queries Service model
createBooking({ data })            → creates Booking record
createCustomer({ data })           → creates Customer record
getBusinessInfo({ businessId })    → queries Business model

The key insight is — router doesn't need to loop back to ai. 
Each user message triggers a full new graph.invoke() call from the socket. 
So END just means "this turn is done, send the reply back". 
The next user message starts a fresh invoke with updated state.

Turn 1  User: "I need a plumber"
        ai    → intent: service_query, step: confirmed
        tool  → listServices() → returns plumbers
        responseNode    → "Here are 3 plumbers available..."
        END

Turn 2  User: "I want to book John"
        ai    → intent: booking, step: collecting_details
        END   → "What is your location?"

Turn 3  User: "New York"
        ai    → step: collecting_details
        END   → "What is your phone number?"

Turn 4  User: "123456"
        ai    → step: confirmed, all data collected
        tool  → createBooking()
        responseNode    → "Booking confirmed for John tomorrow at 3pm!"
        END
*/
