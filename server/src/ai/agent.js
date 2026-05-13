// import { ChatGoogle } from "@langchain/google";
import OpenAI from "openai";
import { ApiError } from "../utils/ApiError.js";
import logger from "../utils/logger.js";

export async function aiNode(state) {
  try {
    const client = new OpenAI({
      apiKey: process.env.NVDIA_API_KEY,
      baseURL: "https://integrate.api.nvidia.com/v1",
    });
    // const llm = new ChatGoogle({
    //   model: "deepseek-v4-flash",
    //   apiKey: process.env.NVDIA_API_KEY,
    //   temperature: 0,
    //   responseMimeType: "application/json",
    // });

    // ← add here
    console.log("📊 state.data:", JSON.stringify(state.data, null, 2));

    // 👇 Case 2: use agent prompt from DB if available and intent needs it
    const needsAgentPrompt = ["booking"].includes(state.intent);
    const agentPrompt =
      needsAgentPrompt && state.agent?.prompt
        ? `\nBusiness context: ${state.agent.prompt}`
        : "";

    const systemPrompt = `
      You are an AI business assistant. Respond ONLY in valid JSON.

      State: flow=${state.flow} step=${state.step}

      Intents: greeting | browse_services | service_query | booking | complaint | unknown | cancellation | availability_check

      Intents detection rules:
      - greeting          → hi, hello, hey, good morning
      - browse_services   → user wants to see ALL categories or ALL services (e.g. "show me all", "what do you have")
      - service_query     → user mentions a SPECIFIC type or category (e.g. "ecommerce", "home service", "tutor", "mechanic", "salon")
                            even short phrases like "give me ecommerce" or "i want a plumber" = service_query
      IMPORTANT:
      If user mentions ANY known business type
      ("home services", "ecommerce", etc)
      ALWAYS classify as service_query
      NEVER browse_services
      - booking           → user wants to book/order or confirm a service
      - cancellation      → user wants to cancel a booking
      - availability_check → user asking if something is available
      - complaint         → unhappy or reporting an issue
      - unknown           → only if truly unclear, single meaningless words, "yes", "no", "okay", "you"

      Rules:
      - Only detect intent, manage flow/step


      context rules:
      - context.businessType  → ONLY set when user says a BROAD type ("home services", "fashion", "education")
      - context.serviceQuery  → ONLY set when user says a SPECIFIC service ("plumber", "shirt", "tutor", "mechanic"). Extract the noun only, no filler words
      - both can be set together: → businessType="home_services" serviceQuery="plumber"
      - both can be set if user mentions both

      ${needsAgentPrompt && state.agent?.prompt ? `Business context:\n${state.agent.prompt}` : ""}

      JSON:
      {
        "intent":"",
        "flow":"",
        "step":"",
        "businessId":null,
        "context":{
          "businessType":null,
           "serviceQuery":null,
          "language":""
        },
      }
    `;

    // Map history to LangChain role format
    // Flows that actually need conversational continuity
    const statefulFlows = ["booking", "cancellation"];

    const needsConversationMemory = statefulFlows.includes(state.flow);

    const filteredMessages = state.messages
      .filter((m) => m.sender === "ai" || m.sender === "user") // 👈 skip bad ones
      .filter((m) => m.content && m.content.length < 500);

    // Booking/cancellation → keep recent history
    // Query/browse/greeting → ONLY latest user message
    const formattedMessages = needsConversationMemory
      ? filteredMessages.slice(-5).map((m) => ({
          role: m.sender === "ai" ? "assistant" : "user",
          content: m.content,
        }))
      : [
          {
            role: "user",
            content:
              filteredMessages[filteredMessages.length - 1]?.content || "",
          },
        ];

    console.log(
      "📨 Messages sent to AI:",
      JSON.stringify(formattedMessages, null, 2),
    );

    // const response = await llm.invoke([
    //   { role: "system", content: systemPrompt },
    //   ...formattedMessages,
    // ]);

    const response = await client.chat.completions.create({
      model: "meta/llama-3.1-70b-instruct",
      messages: [
        { role: "system", content: systemPrompt },
        ...formattedMessages,
      ],
      temperature: 0,
      max_tokens: 300,
    });

    // Parse structured JSON from AI response
    // const raw =
    //   typeof response.content === "string"
    //     ? response.content
    //     : JSON.stringify(response.content);
    const raw = response.choices?.[0]?.message?.content;

    if (!raw || typeof raw !== "string") {
      throw new Error("Empty or invalid model response");
    }

    // Strip markdown code fences if Gemini wraps response
    const cleaned = raw
      .trim()
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    // console.log("AI response:", response.content);
    // console.log("AI response:", raw);
    console.log("parsed AI response:", parsed);

    return {
      intent: parsed.intent,
      flow: parsed.flow,
      step: parsed.step,
      context: parsed.context ?? state.context,
      // businessId: parsed.businessId ?? state.businessId,
      // result: parsed.result,
      // messages: parsed.result ? [{ sender: "ai", content: parsed.result }] : [],
    };
  } catch (error) {
    logger.error(`Error in aiNode: ${error.message}`);
    throw new ApiError(500, error.message);
  }
}
