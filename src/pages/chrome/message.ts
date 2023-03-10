export async function sendMessageToBackgroundAsync(message: Message) {
  return new Promise<DoneResponseMessage["data"]>((resolve, reject) => {
    try {
      sendMessageToBackground({
        message,
        handleSuccess: resolve,
        handleError: reject,
      });
    } catch (error) {
      reject(error);
    }
  });
}

export function sendMessageToBackground({
  message,
  handleSuccess,
  handleError,
}: {
  message: Message;
  handleSuccess?: (data: DoneResponseMessage["data"]) => void;
  handleError?: (error: Error) => void;
}) {
  const port = chrome.runtime.connect();
  port.onMessage.addListener((message: ResponseMessages) => {
    switch (message.type) {
      case "Error":
        handleError?.(message.data);
        break;
      case "Response":
      case "ResponseSlots":
      case "ResponseGPT":
        handleSuccess?.(message.data);
        break;
      default:
        throw Error("unknown message");
    }
  });
  port.onDisconnect.addListener(() => console.log("Port disconnected"));
  port.postMessage(message);
}
