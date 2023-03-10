import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";
import axios, { AxiosInstance } from "axios";
import fetchAdapter from "@vespaiach/axios-fetch-adapter";

let openAiApiInstance: OpenAIApi | null = null;
let axiosInstance: AxiosInstance | null = null;
let configuration: Configuration | null = null;

function checkIsSameApiKey(apiKey: string): boolean {
  return configuration?.apiKey === apiKey;
}

function resetAuthInfoInstance(): void {
  configuration = null;
  openAiApiInstance = null;
}

function createInstancesIfNotExists(apiKey: string) {
  axiosInstance ??= axios.create({
    adapter: fetchAdapter,
  });
  configuration ??= new Configuration({
    apiKey,
  });
  openAiApiInstance ??= new OpenAIApi(configuration, undefined, axiosInstance);

  return {
    openAiApiInstance,
  };
}

export async function chatGPT({
  input,
  slot,
  chats,
  apiKey,
}: {
  slot: ChatGPTSlot;
  chats?: ChatCompletionRequestMessage[];
  input?: string;
  apiKey: string;
}): Promise<{ result: string; tokenUsage: number }> {
  if (!checkIsSameApiKey(apiKey)) {
    resetAuthInfoInstance();
  }

  const { openAiApiInstance } = createInstancesIfNotExists(apiKey);

  const messages: ChatCompletionRequestMessage[] = [];

  if (slot.system) {
    messages.push({
      role: "system",
      content: slot.system,
    });
  }
  if (hasChats(chats)) {
    messages.push(...chats);
  }
  if (input) {
    messages.push({ role: "user", content: input });
  }

  const completion = await openAiApiInstance.createChatCompletion({
    model: "gpt-3.5-turbo",
    max_tokens: slot.maxTokens,
    messages,
    temperature: slot.temperature,
    top_p: slot.topP,
    frequency_penalty: slot.frequencyPenalty,
    presence_penalty: slot.presencePenalty,
  });

  const result =
    completion.data.choices.at(0)?.message?.content ?? "Unknown Response";
  const tokenUsage = completion.data.usage?.total_tokens ?? 0;

  return {
    result,
    tokenUsage,
  };
}

function hasChats(
  chats?: ChatCompletionRequestMessage[]
): chats is ChatCompletionRequestMessage[] {
  return chats !== undefined && chats.length > 0;
}
