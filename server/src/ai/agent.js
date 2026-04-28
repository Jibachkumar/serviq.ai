import { ChatOpenAI } from "@langchain/openai";
import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { searchServicesTool, createBookingTool } from "./tools.js";

const llm = new ChatOpenAI({
  model: "gpt-4.1",
  temperature: 0.3,
});

export async function createAgent() {
  const tools = [searchServicesTool, createBookingTool];

  const agent = await initializeAgentExecutorWithOptions(tools, llm, {
    agentType: "openai-functions",
    verbose: true,
    agentArgs: {
      systemMessage: `
You are an AI business assistant.

Rules:
- Help users find services
- Suggest best options
- Ask for missing details before booking
- Be clear, short, and helpful
- Support Nepali and English
`,
    },
  });

  return agent;
}
