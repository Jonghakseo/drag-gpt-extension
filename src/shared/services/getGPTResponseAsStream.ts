import { ChatCompletionRequestMessage } from "openai";
import { sendMessageToBackground } from "@src/chrome/message";

export async function getGPTResponseAsStream({
  messages,
  onDelta,
  onFinish,
}: {
  messages: ChatCompletionRequestMessage[];
  onDelta: (chunk: string) => unknown;
  onFinish: (result: string) => unknown;
}) {
  return new Promise<{ cancel: () => unknown; firstChunk: string }>(
    (resolve, reject) => {
      const { disconnect } = sendMessageToBackground({
        message: {
          type: "RequestChatGPTStream",
          input: messages,
        },
        handleSuccess: (response) => {
          if (response.isDone || !response.chunk) {
            return onFinish(response.result);
          }
          resolve({ cancel: disconnect, firstChunk: response.chunk });
          onDelta(response.chunk);
        },
        handleError: reject,
      });
    }
  );
}
