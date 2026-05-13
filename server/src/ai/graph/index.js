import { StateGraph, END } from "@langchain/langgraph";

import { aiNode } from "../agent.js";
import { toolNode } from "../nodes/tool.nodes.js";
import { router } from "./nodeRouter.js";
import { responseNode } from "../nodes/response.nodes.js";

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
      value: (x, y) => y ?? x, // ← keep existing if model returns null
      default: () => null,
    },
    data: {
      value: (x, y) => ({ ...x, ...y }),
      default: () => ({}),
    },
    context: {
      value: (x, y) => ({
        businessType:
          y?.businessType !== undefined ? y.businessType : x?.businessType,

        serviceQuery:
          y?.serviceQuery !== undefined ? y.serviceQuery : x?.serviceQuery,

        language: y?.language !== undefined ? y.language : x?.language,
      }),

      default: () => ({
        businessType: null,
        serviceQuery: null,
        language: "",
      }),
    },
    agent: {
      value: (_, y) => y ?? _,
      default: () => null,
    },
    tools: {
      value: (_, y) => (y?.length ? y : _),
      default: () => [],
    },
    result: {
      value: (_, y) => y,
      default: () => null,
    },
    toolCalled: {
      value: (_, y) => y,
      default: () => false,
    },
  };

  const graph = new StateGraph({
    channels: {
      ...GraphState,
    },
  });

  graph.addNode("ai", aiNode);
  graph.addNode("tool", toolNode);
  graph.addNode("response", responseNode);

  graph.setEntryPoint("ai");

  graph.addConditionalEdges("ai", router, {
    tool: "tool",
    response: "response",
    end: END,
  });

  graph.addEdge("tool", "response");

  graph.addEdge("response", END);

  return graph.compile();
}
/*
//  mullti step flow 
    User Message
        ↓
    aiNode
    (intent + extraction only)
        ↓
    router
        ↓
    toolNode
    (fetch data)
        ↓
    responseNode
    (build final response)
        ↓
       END
*/
