type GetDataType<T extends Message["type"]> = Exclude<
  Extract<
    Message,
    {
      type: T;
      data?: unknown;
      input?: unknown;
    }
  >["data"],
  undefined
>;

export async function sendMessageToBackgroundAsync<M extends Message>(
  message: M
) {
  return new Promise<GetDataType<M["type"]>>((resolve, reject) => {
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

export function sendMessageToBackground<M extends Message>({
  message,
  handleSuccess,
  handleError,
}: {
  message: M;
  handleSuccess?: (data: GetDataType<M["type"]>) => void;
  handleError?: (error: Error) => void;
}) {
  const port = chrome.runtime.connect();
  port.onMessage.addListener((responseMessage: M | ErrorMessage) => {
    if (responseMessage.type === "Error") {
      handleError?.(responseMessage.error);
    } else {
      handleSuccess?.(responseMessage.data as GetDataType<M["type"]>);
    }
  });
  port.onDisconnect.addListener(() => console.log("Port disconnected"));
  try {
    port.postMessage(message);
  } catch (error) {
    console.log(error);
  }
  const disconnect = () => {
    port.disconnect();
  };
  return { disconnect };
}

export function sendMessageToClient(
  port: chrome.runtime.Port,
  message: { type: Message["type"]; data: Message["data"] } | ErrorMessage
) {
  try {
    port.postMessage(message);
  } catch (error) {
    console.log(error);
  }
}

export function sendErrorMessageToClient(
  port: chrome.runtime.Port,
  error: unknown
) {
  const sendError = new Error();
  sendError.name = "Unknown Error";

  if (error instanceof Error) {
    error.name && (sendError.name = error.name);
    sendError.message = error.message;
  }

  sendMessageToClient(port, { type: "Error", error: sendError });
}
