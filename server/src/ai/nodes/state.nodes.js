import { classifyIntentAI } from "../intent.classifier.ai.js";
import { updateStateFromIntent } from "../../core/state.manager.js";
import { updateFlowStep } from "../../core/flow.manage.js";
import logger from "../../utils/logger.js";

export async function stateNode(state) {
  try {
    const lastMessage = state.messages[state.messages.length - 1];

    const aiIntent = await classifyIntentAI(lastMessage.content);

    let updated = {
      ...state,
      ...updateStateFromIntent({ state }, aiIntent),
    };

    updated = updateFlowStep(updated);

    return updated;
  } catch (error) {
    logger.error(`error in stateNode function ${error.messages}`);
  }
}
