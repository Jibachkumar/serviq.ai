import { buildGraph } from "../ai/graph/index.js";
import { ApiError } from "../utils/ApiError.js";

const graph = buildGraph();
const HISTORY_LIMIT = 10;

export async function runGraph({
  text,
  history = [],
  state = {},
  agent,
  tools,
  page = 1,
}) {
  try {
    // Paginate history — most recent HISTORY_LIMIT messages
    const totalMessages = history.length;
    const totalPages = Math.ceil(totalMessages / HISTORY_LIMIT);
    const currentPage = Math.min(page, totalPages) || 1;

    const start = Math.max(0, totalMessages - currentPage * HISTORY_LIMIT);
    const end = totalMessages - (currentPage - 1) * HISTORY_LIMIT;
    const paginatedHistory = history.slice(start, end);

    const VALID_FLOWS = ["none", "booking", "order", "rental", "inquiry"];
    const VALID_STEPS = ["start", "collecting_details", "confirmed"];

    const newState = {
      // urrent conversation state (intent, flow, step, data, context)
      // Sanitize incoming state — don't trust what model saved last turn
      intent: state.intent,
      flow: VALID_FLOWS.includes(state.flow) ? state.flow : "none",
      step: VALID_STEPS.includes(state.step) ? state.step : "start",
      data: state.data ?? {},
      context: state.context ?? {},

      agent,
      tools,
      toolCalled: false,

      // Build messages array from history + new user message
      // History comes from DB, shaped as [{ sender, content }, ...]
      messages: [...paginatedHistory, { sender: "user", content: text }],
    };

    const result = await graph.invoke(newState);

    return {
      ...result,
      pagination: {
        page: currentPage,
        totalPages,
        totalMessages,
        hasMore: currentPage < totalPages,
      },
    };
  } catch (error) {
    throw new ApiError(500, error.message);
  }
}
