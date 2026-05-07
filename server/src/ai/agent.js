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

    // Build data context only when needed — saves tokens
    const dataContext = [];
    if (state.data?.businessTypes?.length) {
      dataContext.push(
        `businessTypes=${JSON.stringify(state.data.businessTypes)}`,
      );
    }
    if (state.data?.services?.length) {
      dataContext.push(`services=${JSON.stringify(state.data.services)}`);
    }

    const systemPrompt = `
      You are an AI business assistant. Respond ONLY in valid JSON.

      State: flow=${state.flow} step=${state.step}${dataContext.length ? `\nData: ${dataContext.join(" ")}` : ""}

      Intents: greeting(hi/hello/hey) | browse_services | service_query | booking | complaint | unknown

      Intents:
      - greeting → ONLY: hi, hello, hey, good morning, how are you
      - unknown → single words, unclear, vague, anything not matching above
      - browse_services → ONLY full sentences explicitly requesting services/categories
      - "You", "okay", "yes", "no" → always unknown

      Rules:
      - JSON only, no markdown, no plain text, NO EXCEPTIONS
      - greeting → friendly welcome, ask how you can help
      - browse_services + businessTypes in Data → list them in result
      - service_query + services in Data → list them in result
      - No data in state → result="" STRICTLY, do NOT invent any services or business types
      - NEVER generate service names or business types yourself, ONLY use what is in Data
      - Only detect intent, manage flow/step, write result
      - unknown → result="I'm sorry, I didn't understand that. Could you please rephrase?"
      - complaint → acknowledge the issue, apologize, and ask for more details in result
      
      JSON:
      {
        "intent":"",
        "flow":"",
        "step":"",
        "businessId":null,
        "context":{
          "businessType":null,
          "language":""
        },
        "result":""
      }
    `;

    // Map history to LangChain role format
    const formattedMessages = state.messages
      .filter((m) => m.sender === "ai" || m.sender === "user") // 👈 skip bad ones
      .filter((m) => m.content && m.content.length < 500)
      .map((m) => ({
        role: m.sender === "ai" ? "assistant" : "user",
        content: m.content,
      }));

    // Fix 2 — log the messages so you can see what's wrong
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
      businessId: parsed.businessId ?? state.businessId,
      result: parsed.result,
      messages: parsed.result ? [{ sender: "ai", content: parsed.result }] : [],
    };
  } catch (error) {
    logger.error(`Error in aiNode: ${error.message}`);
    throw new ApiError(500, error.message);
  }
}
