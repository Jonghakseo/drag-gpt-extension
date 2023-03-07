import Logger from "@pages/background/lib/logger";
import { AxiosError } from "axios";

export function sendMessageToClient(
  port: chrome.runtime.Port,
  responseMessage: ResponseMessages
) {
  Logger.send(responseMessage);
  port.postMessage(responseMessage);
}

export function sendErrorMessageToClient(
  port: chrome.runtime.Port,
  error: unknown
) {
  Logger.warn(error);
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
