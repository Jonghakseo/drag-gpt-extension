import { Configuration, OpenAIApi } from "openai";
import axios, { AxiosInstance } from "axios";
import fetchAdapter from "@vespaiach/axios-fetch-adapter";

let openAiApiInstance: OpenAIApi | null = null;
let axiosInstance: AxiosInstance | null = null;
let configuration: Configuration | null = null;

export const DEFAULT_CHAT_GPT_SLOT: ChatGPTSlot = {
  type: "ChatGPT",
  system: "You are a ChatGPT",
  assistant: "Please Answer Me",
  topP: 1,
  frequencyPenalty: 0,
  presencePenalty: 0,
  // maxTokens: 1500,
  temperature: 1,
};

export async function chatGPT({
  input,
  slot,
  apiKey,
}: {
  slot: ChatGPTSlot;
  input: string;
  apiKey: string;
}): Promise<string> {
  configuration ??= new Configuration({
    apiKey,
  });
  axiosInstance ??= axios.create({
    adapter: fetchAdapter,
  });
  openAiApiInstance ??= new OpenAIApi(configuration, undefined, axiosInstance);

  const completion = await openAiApiInstance.createChatCompletion({
    model: "gpt-3.5-turbo",

    max_tokens: slot.maxTokens,
    messages: [
      {
        role: "system",
        content: slot.system,
      },
      {
        role: "assistant",
        content: slot.assistant,
      },
      { role: "user", content: input },
    ],
    temperature: slot.temperature,
    top_p: slot.topP,
    frequency_penalty: slot.frequencyPenalty,
    presence_penalty: slot.presencePenalty,
  });

  return completion.data.choices.at(0)?.message?.content ?? "알 수 없는 에러";
}
