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
import { QuickChatHistoryStorage } from "@pages/background/lib/storage/quickChatHistoryStorage";
import { exhaustiveMatchingGuard } from "@src/shared/ts-util/exhaustiveMatchingGuard";

reloadOnUpdate("pages/background");

type RequiredDataNullableInput<T extends Message> = {
  type: T["type"];
  input?: unknown;
  data: Exclude<T["data"], undefined>;
};

chrome.runtime.onConnect.addListener((port) => {
  port.onDisconnect.addListener(() => console.log("Port disconnected"));
  port.onMessage.addListener(async (message: Message) => {
    Logger.receive(message);

    const sendResponse = <M extends Message>(
      message: RequiredDataNullableInput<M>
    ) => {
      Logger.send(message);
      sendMessageToClient(port, message);
    };

    try {
      switch (message.type) {
        case "GetSlots": {
          const slots = await SlotStorage.getAllSlots();
          sendResponse({ type: "GetSlots", data: slots });
          break;
        }
        case "AddNewSlot": {
          await SlotStorage.addSlot(message.input);
          sendResponse({ type: "AddNewSlot", data: "success" });
          break;
        }
        case "SelectSlot": {
          const slots = await SlotStorage.getAllSlots();
          const updatedSlots = slots.map((slot) => ({
            ...slot,
            isSelected: message.data === slot.id,
          }));
          await SlotStorage.setAllSlots(updatedSlots);
          sendResponse({ type: "SelectSlot", data: slots });
          break;
        }
        case "UpdateSlot": {
          const slots = await SlotStorage.updateSlot(message.input);
          sendResponse({ type: "UpdateSlot", data: slots });
          break;
        }
        case "DeleteSlot": {
          const slots = await SlotStorage.deleteSlot(message.input);
          sendResponse({ type: "DeleteSlot", data: slots });
          break;
        }
        case "GetAPIKey": {
          const apiKey = await ApiKeyStorage.getApiKey();
          sendResponse({ type: "GetAPIKey", data: apiKey });
          break;
        }
        case "SaveAPIKey":
          await chatGPT({
            input: "hello",
            apiKey: message.input,
            slot: { type: "ChatGPT" },
          }).catch((error) => {
            ApiKeyStorage.setApiKey(null);
            throw error;
          });
          await ApiKeyStorage.setApiKey(message.input);
          sendResponse({ type: "SaveAPIKey", data: "success" });
          break;
        case "ResetAPIKey":
          await ApiKeyStorage.setApiKey(null);
          sendResponse({ type: "ResetAPIKey", data: "success" });
          break;
        case "RequestOnetimeChatGPT": {
          const selectedSlot = await SlotStorage.getSelectedSlot();
          const apiKey = await ApiKeyStorage.getApiKey();
          const response = await chatGPT({
            input: message.input,
            slot: selectedSlot,
            apiKey,
          });
          sendResponse({
            type: "RequestOnetimeChatGPT",
            data: response,
          });
          break;
        }
        case "RequestQuickChatGPT": {
          const apiKey = await ApiKeyStorage.getApiKey();
          const response = await chatGPT({
            chats: message.input,
            slot: { type: "ChatGPT" },
            apiKey,
          });
          sendResponse({ type: "RequestQuickChatGPT", data: response });
          await QuickChatHistoryStorage.pushChatHistories([
            {
              role: "user",
              content: message.input?.at(-1)?.content ?? "",
            },
            {
              role: "assistant",
              content: response.result,
            },
          ]);
          break;
        }
        case "RequestOngoingChatGPT": {
          const selectedSlot = await SlotStorage.getSelectedSlot();
          const apiKey = await ApiKeyStorage.getApiKey();
          const response = await chatGPT({
            chats: message.input,
            slot: selectedSlot,
            apiKey,
          });
          sendResponse({ type: "RequestOngoingChatGPT", data: response });
          break;
        }
        case "GetQuickChatHistory": {
          const chats = await QuickChatHistoryStorage.getChatHistories();
          sendResponse({ type: "GetQuickChatHistory", data: chats });
          break;
        }
        case "ResetQuickChatHistory": {
          await QuickChatHistoryStorage.resetChatHistories();
          sendResponse({ type: "ResetQuickChatHistory", data: "success" });
          break;
        }
        default: {
          exhaustiveMatchingGuard(message);
        }
      }
    } catch (error) {
      Logger.warn(error);
      sendErrorMessageToClient(port, error);
    }
  });
});
