import Logger from "@pages/background/lib/utils/logger";
import { AxiosError } from "axios";

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
        handleSuccess?.(message.data);
        break;
      default:
        throw Error("unknown message");
    }
  });
  port.onDisconnect.addListener(() => console.log("Port disconnected"));
  port.postMessage(message);
}

export function sendMessageToClient(
  port: chrome.runtime.Port,
  responseMessage: ResponseMessages
) {
  port.postMessage(responseMessage);
}

export function sendErrorMessageToClient(
  port: chrome.runtime.Port,
  error: unknown
) {
  if (!(error instanceof Error)) {
    const unknownError = new Error();
    unknownError.name = "Unknown Error";
    sendMessageToClient(port, { type: "Error", data: unknownError });
    return;
  }
  if ((error as AxiosError).isAxiosError) {
    const axiosError = error as AxiosError;
    const customError = new Error();
    customError.message = axiosError.response?.data?.error?.message;
    customError.name = axiosError.response?.data?.error?.code ?? error.name;
    sendMessageToClient(port, { type: "Error", data: customError });
  } else {
    sendMessageToClient(port, { type: "Error", data: error });
  }
}
