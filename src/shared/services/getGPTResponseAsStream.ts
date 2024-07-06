import { sendMessageToBackground } from "@src/chrome/message";

export async function getQuickGPTResponseAsStream({
  messages,
  isGpt4Turbo,
  onDelta,
  onFinish,
}: {
  messages: Chat[];
  isGpt4Turbo: boolean;
  onDelta: (chunk: string) => unknown;
  onFinish: (result: string) => unknown;
}) {
  return new Promise<{ cancel: () => unknown; firstChunk: string }>(
    (resolve, reject) => {
      const { disconnect } = sendMessageToBackground({
        message: {
          type: "RequestQuickChatGPTStream",
          input: { messages, isGpt4Turbo },
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

export async function getDragGPTResponseAsStream({
  input,
  onDelta,
  onFinish,
}: {
  input: { chats: Chat[]; sessionId: string };
  onDelta: (chunk: string) => unknown;
  onFinish: (result: string) => unknown;
}) {
  return new Promise<{ cancel: () => unknown; firstChunk: string }>(
    (resolve, reject) => {
      const { disconnect } = sendMessageToBackground({
        message: {
          type: "RequestDragGPTStream",
          input,
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
