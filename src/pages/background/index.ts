import reloadOnUpdate from "virtual:reload-on-update-in-background-script";
import "regenerator-runtime/runtime.js";
import { AxiosError } from "axios";
import { LocalStorage } from "@pages/background/lib/localStorage";
import { chatGPT, DEFAULT_CHAT_GPT_SLOT } from "@pages/background/lib/chatGPT";

reloadOnUpdate("pages/background");

// background script
chrome.runtime.onMessage.addListener(function (request, sender, _sendResponse) {
  const message: Message = request;
  Logger.receive(message);

  const sendResponse = (
    message: DoneResponseMessage | ErrorResponseMessage
  ) => {
    Logger.send(message);
    return _sendResponse(message);
  };

  const handleError = (error: unknown) => {
    console.warn(error);
    if (!(error instanceof Error)) {
      sendResponse({ type: "Error", data: Error("Unknown Error") });
      return;
    }
    if ((error as AxiosError).isAxiosError) {
      const axiosError = error as AxiosError;
      const customError = new Error();
      customError.message = axiosError.response?.data?.error?.message;
      customError.name = axiosError.response?.data?.error?.code ?? error.name;
      sendResponse({ type: "Error", data: customError });
    } else {
      sendResponse({ type: "Error", data: error });
    }
  };

  switch (message.type) {
    case "GetSlots": {
      (async () => {
        try {
          const slots = await LocalStorage.getAllSlots();
          sendResponse({ type: "ResponseSlots", data: slots });
        } catch (error) {
          handleError(error);
        }
      })();
      break;
    }
    case "AddNewSlot": {
      (async () => {
        try {
          const slots = await LocalStorage.addSlot(message.data);
          sendResponse({ type: "ResponseSlots", data: slots });
        } catch (error) {
          handleError(error);
        }
      })();
      break;
    }
    case "SelectSlot": {
      (async () => {
        try {
          const slots = await LocalStorage.getAllSlots();
          const updatedSlots = slots.map((slot) => ({
            ...slot,
            isSelected: message.data === slot.id,
          }));
          await LocalStorage.setAllSlots(updatedSlots);
          sendResponse({ type: "ResponseSlots", data: slots });
        } catch (error) {
          handleError(error);
        }
      })();
      break;
    }
    case "UpdateSlotData": {
      (async () => {
        try {
          const slots = await LocalStorage.updateSlot(message.data);
          sendResponse({ type: "ResponseSlots", data: slots });
        } catch (error) {
          handleError(error);
        }
      })();
      break;
    }
    case "DeleteSlot": {
      (async () => {
        try {
          const slots = await LocalStorage.deleteSlot(message.data);
          sendResponse({ type: "ResponseSlots", data: slots });
        } catch (error) {
          handleError(error);
        }
      })();
      break;
    }
    case "GetAPIKey":
      (async () => {
        try {
          const apiKey = await LocalStorage.getApiKey();
          sendResponse({ type: "Response", data: String(apiKey) });
        } catch (error) {
          handleError(error);
        }
      })();
      break;
    case "SaveAPIKey":
      (async () => {
        try {
          await chatGPT({
            input: "hello",
            apiKey: message.data,
            slot: DEFAULT_CHAT_GPT_SLOT,
          });
          await LocalStorage.setApiKey(message.data);
          sendResponse({ type: "Response", data: "success" });
        } catch (error) {
          handleError(error);
        }
      })();
      break;
    case "ResetAPIKey":
      (async () => {
        try {
          await LocalStorage.setApiKey(null);
          sendResponse({ type: "Response", data: "success" });
        } catch (error) {
          handleError(error);
        }
      })();
      break;
    case "RequestSelectionMessage":
      (async () => {
        try {
          const selectedSlot = await LocalStorage.getSelectedSlot();
          const apiKey = await LocalStorage.getApiKey();

          switch (selectedSlot.type) {
            case "ChatGPT": {
              const response = await chatGPT({
                input: message.data,
                slot: selectedSlot,
                apiKey: String(apiKey),
              });
              sendResponse({ type: "Response", data: response });
              break;
            }
          }
        } catch (error) {
          handleError(error);
        }
      })();
      break;
    default:
      console.error("unknown message:" + JSON.stringify(message));
      break;
  }

  return true;
});

const Logger = {
  receive: (message: Message) => {
    console.log(
      "Message Receive:",
      `${message.type}\ndata: ${
        message.data ? JSON.stringify(message.data) : "none"
      }`
    );
  },
  send: (message: Message) => {
    console.log(
      "Message Sending:",
      `${message.type}\ndata: ${
        message.data ? JSON.stringify(message.data) : "none"
      }`
    );
  },
};
