import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";
import axios, { AxiosInstance } from "axios";
import fetchAdapter from "@vespaiach/axios-fetch-adapter";

let openAiApiInstance: OpenAIApi | null = null;
let axiosInstance: AxiosInstance | null = null;
let configuration: Configuration | null = null;

export async function chatGPT({
  input,
  slot,
  histories,
  apiKey,
}: {
  slot: ChatGPTSlot;
  histories?: ChatCompletionRequestMessage[];
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

  const messages: ChatCompletionRequestMessage[] = [];

  if (slot.system) {
    messages.push({
      role: "system",
      content: slot.system,
    });
  }
  if (histories && histories.length > 0) {
    messages.push(...histories);
  }

  const completion = await openAiApiInstance.createChatCompletion({
    model: "gpt-3.5-turbo",
    max_tokens: slot.maxTokens ?? 1500,
    messages: messages.concat({ role: "user", content: input }),
    temperature: slot.temperature,
    top_p: slot.topP,
    frequency_penalty: slot.frequencyPenalty,
    presence_penalty: slot.presencePenalty,
  });

  return completion.data.choices.at(0)?.message?.content ?? "알 수 없는 에러";
}
