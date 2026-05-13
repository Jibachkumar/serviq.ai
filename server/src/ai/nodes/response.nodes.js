export function responseNode(state) {
  // Greeting
  if (state.intent === "greeting") {
    const types = state.data.businessTypes || [];
    return {
      result: {
        type: "greeting",
        message: "Hello! How can I help you today. what are you looking for?",
        items: types,
      },
    };
  }

  // Unknown
  if (state.intent === "unknown") {
    return {
      result: {
        type: "text",
        message: "I'm sorry, I didn't understand that. Could you rephrase?",
      },
    };
  }

  // Browse services
  if (state.intent === "browse_services") {
    const types = state.data.businessTypes || [];

    return {
      result: {
        type: "businessTypes",
        message:
          "Thank you for reaching out — we’re delighted to assist you and provide you with the best possible service.",
        items: types,
      },
    };
  }

  // Service query
  if (state.intent === "service_query") {
    // categories
    if (state.data.categories?.length) {
      return {
        result: {
          type: "categories",
          message:
            "Here are some trusted home service categories that might help you.",
          items: state.data.categories,
        },
      };
    }

    // providers
    if (state.data.providers?.length) {
      return {
        result: {
          type: "providers",
          message:
            "Here are some trusted home service categories that might help you.",
          items: state.data.providers,
        },
      };
    }

    return {
      result: "No services found.",
    };
  }

  return {
    result: "",
  };
}
