import { AxiosError } from "axios";

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
  port.postMessage(message);
}

export function sendMessageToClient(
  port: chrome.runtime.Port,
  message: { type: Message["type"]; data: Message["data"] } | ErrorMessage
) {
  port.postMessage(message);
}

export function sendErrorMessageToClient(
  port: chrome.runtime.Port,
  error: unknown
) {
  if (!(error instanceof Error)) {
    const unknownError = new Error();
    unknownError.name = "Unknown Error";
    sendMessageToClient(port, { type: "Error", error: unknownError });
    return;
  }
  if ((error as AxiosError).isAxiosError) {
    const axiosError = error as AxiosError;
    const customError = new Error();
    customError.message = axiosError.response?.data?.error?.message;
    customError.name = axiosError.response?.data?.error?.code ?? error.name;
    sendMessageToClient(port, { type: "Error", error: customError });
  } else {
    sendMessageToClient(port, { type: "Error", error });
  }
}
