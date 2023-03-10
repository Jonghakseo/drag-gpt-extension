import "regenerator-runtime/runtime.js";
import reloadOnUpdate from "virtual:reload-on-update-in-background-script";
import { SlotStorage } from "@pages/background/lib/storage/slotStorage";
import { ApiKeyStorage } from "@pages/background/lib/storage/apiKeyStorage";
import { chatGPT } from "@pages/background/lib/infra/chatGPT";
import Logger from "@pages/background/lib/utils/logger";
import {
  sendErrorMessageToClient,
  sendMessageToClient,
} from "@src/chrome/message";

reloadOnUpdate("pages/background");

chrome.runtime.onConnect.addListener((port) => {
  port.onDisconnect.addListener(() => console.log("Port disconnected"));
  port.onMessage.addListener(async (message: Message) => {
    Logger.receive(message);

    const sendResponse = (responseMessage: DoneResponseMessage) => {
      Logger.send(responseMessage);
      sendMessageToClient(port, responseMessage);
    };

    try {
      switch (message.type) {
        case "GetSlots": {
          const slots = await SlotStorage.getAllSlots();
          sendResponse({ type: "ResponseSlots", data: slots });
          break;
        }
        case "AddNewSlot": {
          const slots = await SlotStorage.addSlot(message.data);
          sendResponse({ type: "ResponseSlots", data: slots });
          break;
        }
        case "SelectSlot": {
          const slots = await SlotStorage.getAllSlots();
          const updatedSlots = slots.map((slot) => ({
            ...slot,
            isSelected: message.data === slot.id,
          }));
          await SlotStorage.setAllSlots(updatedSlots);
          sendResponse({ type: "ResponseSlots", data: slots });
          break;
        }
        case "UpdateSlotData": {
          const slots = await SlotStorage.updateSlot(message.data);
          sendResponse({ type: "ResponseSlots", data: slots });
          break;
        }
        case "DeleteSlot": {
          const slots = await SlotStorage.deleteSlot(message.data);
          sendResponse({ type: "ResponseSlots", data: slots });
          break;
        }
        case "GetAPIKey": {
          const apiKey = await ApiKeyStorage.getApiKey();
          sendResponse({ type: "Response", data: String(apiKey) });
          break;
        }
        case "SaveAPIKey":
          await chatGPT({
            input: "hello",
            apiKey: message.data,
            slot: { type: "ChatGPT" },
          }).catch((error) => {
            ApiKeyStorage.setApiKey(null);
            throw error;
          });
          await ApiKeyStorage.setApiKey(message.data);
          sendResponse({ type: "Response", data: "success" });
          break;
        case "ResetAPIKey":
          await ApiKeyStorage.setApiKey(null);
          sendResponse({ type: "Response", data: "success" });
          break;
        case "RequestSelectionMessage": {
          const selectedSlot = await SlotStorage.getSelectedSlot();
          const apiKey = await ApiKeyStorage.getApiKey();

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
        case "RequestAdditionalChat": {
          const selectedSlot = await SlotStorage.getSelectedSlot();
          const apiKey = await ApiKeyStorage.getApiKey();
          switch (selectedSlot.type) {
            case "ChatGPT": {
              const response = await chatGPT({
                input: message.data.input,
                histories: message.data.histories,
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
      Logger.warn(error);
      sendErrorMessageToClient(port, error);
    }
  });
});
