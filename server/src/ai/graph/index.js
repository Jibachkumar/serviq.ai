import { StateGraph, END } from "@langchain/langgraph";

import { aiNode } from "../agent.js";
import { toolNode } from "../nodes/tool.nodes.js";
// import { stateNode } from "./nodes/state.node.js";
import { router } from "./nodeRouter.js";

export function buildGraph() {
  const GraphState = {
    messages: {
      value: (x, y) => [...x, ...y],
      default: () => [],
    },
    intent: {
      value: (_, y) => y,
      default: () => null,
    },
    flow: {
      value: (_, y) => y,
      default: () => "none",
    },
    step: {
      value: (_, y) => y,
      default: () => "start",
    },
    businessId: {
      value: (_, y) => y,
      default: () => null,
    },
    data: {
      value: (x, y) => ({ ...x, ...y }),
      default: () => ({}),
    },
    context: {
      value: (x, y) => ({ ...x, ...y }), // merge like data
      default: () => ({ businessType: "", language: "" }),
    },
    result: {
      value: (_, y) => y,
      default: () => null,
    },
  };

  const graph = new StateGraph({
    channels: {
      ...GraphState,
    },
  });

  graph.addNode("ai", aiNode);
  graph.addNode("tool", toolNode);
  // graph.addNode("state", stateNode);

  graph.setEntryPoint("ai");

  graph.addConditionalEdges("ai", router, {
    tool: "tool",
    end: END,
  });

  // tool always goes back to ai for natural reply
  graph.addEdge("tool", "ai");

  return graph.compile();
}
/*
//  mullti step flow 
\User message
     ↓
  AI (1st): AI Node          ← 1st call: detects intent, result: "" (no data yet)
     ↓
  Router           ← sees no data → routes to "tool"
     ↓
  Tool Node        ← fetches real data from DB
     ↓
  AI (2nd): AI Node          ← 2nd call: now has data, result: "Here are services..."
     ↓
  Router           ← data exists → falls to "end"
     ↓
   END             ← graph finishes
*/
