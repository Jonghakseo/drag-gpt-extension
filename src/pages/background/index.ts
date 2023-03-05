import reloadOnUpdate from "virtual:reload-on-update-in-background-script";
import "regenerator-runtime/runtime.js";
import { Configuration, OpenAIApi } from "openai";
import axios, { AxiosError } from "axios";
import fetchAdapter from "@vespaiach/axios-fetch-adapter";

reloadOnUpdate("pages/background");

async function chatGPT({
  role,
  assistant,
  input,
  apiKey,
}: {
  role?: string;
  assistant?: string;
  input: string;
  apiKey: string;
}): Promise<string> {
  const configuration = new Configuration({
    apiKey,
  });
  const axiosInstance = axios.create({
    adapter: fetchAdapter,
  });

  const openai = new OpenAIApi(configuration, undefined, axiosInstance);

  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    // max 4000
    max_tokens: 1500,
    messages: [
      {
        role: "system",
        content: role ?? "You are a ChatGPT",
      },
      {
        role: "assistant",
        content: assistant ?? "Please Answer Me Briefly.",
      },
      { role: "user", content: input },
    ],
    // 의외성 (0~1)
    temperature: 0.3,
    // 단어 풀의 범위(0~1)
    top_p: 0.5,
    // 자주 사용하는 단어 억제
    frequency_penalty: 0.1,
    // 이미 사용된 단어 억제
    presence_penalty: 0.1,
  });

  return completion.data.choices.at(0)?.message?.content ?? "알 수 없는 에러";
}

class LocalStorage {
  static API_KEY = "OPEN_AI_API_KEY";
  static ROLE = "GPT_ROLE";
  static ASSISTANT_PROMPT = "ASSISTANT_PROMPT";

  static async save(key: string, value: unknown): Promise<void> {
    return chrome.storage.local.set({ [key]: value });
  }

  static async load(key: string): Promise<unknown> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get([key], (result) => {
        const value = result[key];
        if (value === null || value === undefined) {
          reject("NotFound Key");
        } else {
          resolve(value);
        }
      });
    });
  }
}

const Logger = {
  receive: (message: Message) => {
    console.log(
      "Message Receive:",
      `${message.type}\ndata: ${message.data ?? "none"}`
    );
  },
  send: (message: Message) => {
    console.log(
      "Message Sending:",
      `${message.type}\ndata: ${message.data ?? "none"}`
    );
  },
};

// background script
chrome.runtime.onMessage.addListener(function (request, sender, _sendResponse) {
  const message: Message = request;
  Logger.receive(message);

  const sendResponse = (message: Message) => {
    Logger.send(message);
    return _sendResponse(message);
  };

  const handleError = (error: Error & AxiosError) => {
    if (error.isAxiosError) {
      const customError = new Error();
      customError.message = error.response.data?.error?.message;
      customError.name = error.response.data?.error?.code ?? error.name;
      sendResponse({ type: "Error", data: customError });
    } else {
      sendResponse({ type: "Error", data: error });
    }
  };

  switch (message.type) {
    case "SetRole": {
      (async () => {
        try {
          await LocalStorage.save(LocalStorage.ROLE, message.data);
          sendResponse({ type: "Response", data: "success" });
        } catch (error) {
          handleError(error);
          console.warn(error);
        }
      })();
      break;
    }
    case "SetAssistantPrompt": {
      (async () => {
        try {
          await LocalStorage.save(LocalStorage.ASSISTANT_PROMPT, message.data);
          sendResponse({ type: "Response", data: "success" });
        } catch (error) {
          handleError(error);
          console.warn(error);
        }
      })();
      break;
    }
    case "GetRole": {
      (async () => {
        try {
          const role = await LocalStorage.load(LocalStorage.ROLE);
          sendResponse({ type: "Response", data: String(role) });
        } catch (error) {
          handleError(error);
          console.warn(error);
        }
      })();
      break;
    }
    case "GetAssistantPrompt": {
      (async () => {
        try {
          const assistantPrompt = await LocalStorage.load(
            LocalStorage.ASSISTANT_PROMPT
          );
          sendResponse({ type: "Response", data: String(assistantPrompt) });
        } catch (error) {
          handleError(error);
          console.warn(error);
        }
      })();
      break;
    }
    case "ResetAPIKey":
      (async () => {
        try {
          await LocalStorage.save(LocalStorage.API_KEY, null);
          sendResponse({ type: "Response", data: "success" });
        } catch (error) {
          handleError(error);
          console.warn(error);
        }
      })();
      break;
    case "SaveAPIKey":
      (async () => {
        try {
          await chatGPT({ input: "test", apiKey: message.data });
          await LocalStorage.save(LocalStorage.API_KEY, message.data);
          sendResponse({ type: "Response", data: "success" });
        } catch (error) {
          handleError(error);
          console.warn(error);
        }
      })();
      break;
    case "RequestSelectionMessage":
      (async () => {
        try {
          const apiKey = await LocalStorage.load(LocalStorage.API_KEY);
          const role = await LocalStorage.load(LocalStorage.ROLE);
          const assistant = await LocalStorage.load(
            LocalStorage.ASSISTANT_PROMPT
          );
          const response = await chatGPT({
            input: message.data,
            apiKey: String(apiKey),
            assistant: String(assistant),
            role: String(role),
          });
          sendResponse({ type: "Response", data: response });
        } catch (error) {
          handleError(error);
          console.warn(error);
        }
      })();
      break;
    case "GetAPIKey":
      (async () => {
        try {
          const apiKey = await LocalStorage.load(LocalStorage.API_KEY);
          sendResponse({ type: "Response", data: String(apiKey) });
        } catch (error) {
          handleError(error);
          console.warn(error);
        }
      })();
      break;
    default:
      console.error("unknown message:" + JSON.stringify(message));
      break;
  }

  return true;
});
