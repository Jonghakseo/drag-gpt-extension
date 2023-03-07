import reloadOnUpdate from "virtual:reload-on-update-in-background-script";
import "regenerator-runtime/runtime.js";
import { LocalStorage } from "@pages/background/lib/localStorage";
import { chatGPT } from "@pages/background/lib/chatGPT";
import Logger from "@pages/background/lib/logger";
import {
  sendErrorMessageToClient,
  sendMessageToClient,
} from "@pages/background/lib/message";

reloadOnUpdate("pages/background");

chrome.runtime.onConnect.addListener((port) => {
  port.onDisconnect.addListener(() => console.log("Port disconnected"));
  port.onMessage.addListener(async (message: Message) => {
    Logger.receive(message);

    const sendResponse = (responseMessage: DoneResponseMessage) =>
      sendMessageToClient(port, responseMessage);

    try {
      switch (message.type) {
        case "GetSlots": {
          const slots = await LocalStorage.getAllSlots();
          sendResponse({ type: "ResponseSlots", data: slots });
          break;
        }
        case "AddNewSlot": {
          const slots = await LocalStorage.addSlot(message.data);
          sendResponse({ type: "ResponseSlots", data: slots });
          break;
        }
        case "SelectSlot": {
          const slots = await LocalStorage.getAllSlots();
          const updatedSlots = slots.map((slot) => ({
            ...slot,
            isSelected: message.data === slot.id,
          }));
          await LocalStorage.setAllSlots(updatedSlots);
          sendResponse({ type: "ResponseSlots", data: slots });
          break;
        }
        case "UpdateSlotData": {
          const slots = await LocalStorage.updateSlot(message.data);
          sendResponse({ type: "ResponseSlots", data: slots });
          break;
        }
        case "DeleteSlot": {
          const slots = await LocalStorage.deleteSlot(message.data);
          sendResponse({ type: "ResponseSlots", data: slots });
          break;
        }
        case "GetAPIKey": {
          const apiKey = await LocalStorage.getApiKey();
          sendResponse({ type: "Response", data: String(apiKey) });
          break;
        }
        case "SaveAPIKey":
          await chatGPT({
            input: "hello",
            apiKey: message.data,
            slot: { type: "ChatGPT" },
          });
          await LocalStorage.setApiKey(message.data);
          sendResponse({ type: "Response", data: "success" });
          break;
        case "ResetAPIKey":
          await LocalStorage.setApiKey(null);
          sendResponse({ type: "Response", data: "success" });
          break;
        case "RequestSelectionMessage": {
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
          break;
        }
        default:
          Logger.error("unknown message:" + JSON.stringify(message));
          break;
      }
    } catch (error) {
      sendErrorMessageToClient(port, error);
    }
  });
});
