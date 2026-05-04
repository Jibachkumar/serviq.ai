import { ChatGoogle } from "@langchain/google";
import { ApiError } from "../utils/ApiError.js";
import logger from "../utils/logger.js";

export async function aiNode(state) {
  try {
    const llm = new ChatGoogle({
      model: "gemini-2.5-flash",
      apiKey: process.env.GEMINI_API_KEY,
      temperature: 0.3,
      responseMimeType: "application/json",
    });

    const systemPrompt = `
      You are a helpful AI business assistant.

      Current state:
      - flow: ${state.flow}
      - step: ${state.step}
      - data collected so far: ${JSON.stringify(state.data)}

      ${
        state.data?.businessTypes
          ? `Available business categories: ${JSON.stringify(state.data.businessTypes)}
          Rules:
          - You MUST list them explicitly
          - DO NOT generate your own`
          : ""
      }

      ${
        state.data?.services
          ? `Available services: ${JSON.stringify(state.data.services)}
          Rules:
          - You MUST list these services exactly as provided
          - Include name, price, and description
          - DO NOT invent or modify services`
          : ""
      }

      Instructions:
      - Understand the user's intent
      - Map their need to the correct business type when possible
      - Use conversation state (flow, step, data) to continue multi-step flows

      Intent rules:
      - "service_query"   → user mentioned a specific need
      - "browse_services" → user is exploring or asking generally
      - "booking"         → user wants to book or confirm a service
      - "complaint"       → user unhappy or reporting issue
      - "unknown"         → fallback if unclear

      Flow rules:
      - Use "booking" flow when user starts booking
      - Otherwise keep flow as "none"

      Step rules:
      - "start"               → initial or browsing stage
      - "collecting_details"  → ask ONE missing detail at a time (e.g., location, date, phone)
      - "confirmed"           → ONLY when ALL required booking data is collected

      Booking behavior:
      - NEVER ask multiple questions at once
      - Ask for ONE missing field per response
      - Continue until all required fields are collected
      - Then mark step as "confirmed"

       Tool-fetch rules (CRITICAL):
      - If intent is "browse_services" and you do NOT have businessTypes in state.data, 
        set result to "" (empty string) — a tool will fetch the data first.
      - If intent is "service_query" and you do NOT have services in state.data,
        set result to "" (empty string) — a tool will fetch the data first.
      - Only generate a real "result" reply when the required data is already in state.data.

      CRITICAL OUTPUT RULES (VERY IMPORTANT):
      - You are strictly a JSON generator.
      - You must output ONLY a single valid JSON object.
      - No markdown, no backticks, no explanation, no prefix text.
      - If you fail, the system will reject your response.

      Required JSON format:
      {
        "intent": "greeting | service_query | browse_services | booking | complaint | unknown",
        "flow": "none | booking | order | rental | inquiry",
        "step": "start | collecting_details | confirmed",
        "businessId": null,
        "context": {
          "businessType": null,
          "language": ""
        },
        "data": {},
        "result": "your natural language reply to the user"
      }
    `;

    // Map history to LangChain role format
    const formattedMessages = state.messages.map((m) => ({
      role: m.sender === "ai" ? "assistant" : "user",
      content: m.content,
    }));

    const response = await llm.invoke([
      { role: "system", content: systemPrompt },
      ...formattedMessages,
    ]);

    // Parse structured JSON from AI response
    const raw =
      typeof response.content === "string"
        ? response.content
        : JSON.stringify(response.content);

    // Strip markdown code fences if Gemini wraps response
    const cleaned = raw
      .trim()
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    console.log("AI response:", response.content);
    console.log("parsed AI response:", parsed);

    return {
      intent: parsed.intent,
      flow: parsed.flow,
      step: parsed.step,
      // data: parsed.data ?? {},
      context: parsed.context ?? state.context,
      businessId: parsed.businessId ?? state.businessId,
      result: parsed.result,
      messages: parsed.result ? [{ sender: "ai", content: parsed.result }] : [],

      // if booking started, wipe browsing data but keep collected user fields
      data:
        parsed.intent === "booking"
          ? { ...state.data, businessTypes: undefined, services: undefined }
          : (parsed.data ?? {}),
    };
  } catch (error) {
    logger.error(`Error in aiNode: ${error.message}`);
    throw new ApiError(500, error.message);
  }
}
