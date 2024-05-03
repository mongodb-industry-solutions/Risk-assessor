import {
  LLM,
  RelevancyEvaluator,
  serviceContextFromDefaults,
} from "llamaindex";
import { EvaluateQualityFunc } from "./EvaluateQualityFunc";
import { ConversationGeneratedData } from "../generate";
import { ObjectId, UserMessage, logger, Message } from "mongodb-chatbot-server";
import { strict as assert } from "assert";
import { EvalResult } from "./EvaluationStore";

interface MakeEvaluatorParams {
  llamaIndexLlm: LLM;
}

/**
  Evaluate whether the assistant's response is relevant to the user query
  Wraps the LlamaIndex.ts [`RelevancyEvaluator`](https://ts.llamaindex.ai/modules/evaluation/modules/relevancy).
 */
export function makeEvaluateConversationRelevancy({
  llamaIndexLlm,
}: MakeEvaluatorParams): EvaluateQualityFunc {
  const ctx = serviceContextFromDefaults({
    llm: llamaIndexLlm,
  });

  const evaluator = new RelevancyEvaluator({
    serviceContext: ctx,
  });

  return async ({ runId, generatedData }) => {
    assert(
      generatedData.type === "conversation",
      "Invalid data type. Expected 'conversation' data."
    );
    const conversationData = generatedData as ConversationGeneratedData;
    const {
      data: { messages },
      evalData: { name },
    } = conversationData;
    const ragUserMessage = messages.find(
      (m: Message) => m.role === "user" && m.contextContent
    ) as UserMessage;
    if (!ragUserMessage) {
      throw new Error(`No user message for test case '${name}'.`);
    }

    const texts =
      ragUserMessage.contextContent?.map(({ text }) => text ?? "") ?? [];

    const userQueryContent = ragUserMessage.content;

    const assistantMessage = messages[messages.length - 1];
    const { content: assistantResponseContent, role } = assistantMessage;
    if (role !== "assistant") {
      throw new Error(
        `No final assistant message found for test case '${name}'. Something unexpected occurred. Please check the test case data.`
      );
    }

    const { score } = await evaluator.evaluate({
      query: userQueryContent,
      response: assistantResponseContent,
      contexts: texts,
    });

    logger.info(
      `The response to '${conversationData.evalData.name}' is ${
        score ? "'relevant'" : "'not relevant'"
      }`
    );
    return {
      generatedDataId: generatedData._id,
      result: score,
      type: "conversation_relevancy",
      _id: new ObjectId(),
      createdAt: new Date(),
      commandRunMetadataId: runId,
      metadata: {
        contextContent: texts,
        userQueryContent,
        assistantResponseContent,
      },
    } satisfies EvalResult;
  };
}
