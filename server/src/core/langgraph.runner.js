import { buildGraph } from "../ai/graph/index.js";
import { ApiError } from "../utils/ApiError.js";

const graph = buildGraph();

export async function runGraph({ text, history = [], state = {} }) {
  try {
    const newState = {
      // Spread current conversation state (intent, flow, step, data, context)
      ...state,

      // Build messages array from history + new user message
      // History comes from DB, shaped as [{ sender, content }, ...]
      messages: [...history, { sender: "user", content: text }],
    };

    const result = await graph.invoke(newState);

    return result;
  } catch (error) {
    throw new ApiError(500, error.message);
  }
}
