import type {
  ChatCompletionRequestMessage,
  CreateChatCompletionRequest,
} from "openai";

type Error = {
  error: {
    type: string;
    code: string | "context_length_exceeded";
    message?: string;
  };
};
export async function chatGPT({
  input,
  slot,
  chats,
  apiKey,
  onDelta,
}: {
  slot: ChatGPTSlot;
  chats?: Chat[];
  input?: string;
  apiKey: string;
  onDelta?: (chunk: string) => unknown;
}): Promise<{ result: string }> {
  const messages: ChatCompletionRequestMessage[] = [];

  if (slot.system) {
    messages.push({
      role: "system",
      content: slot.system,
    });
  }
  if (hasChats(chats)) {
    messages.push(...convertChatsToMessages(chats));
  }
  if (input) {
    messages.push({ role: "user", content: input });
  }

  let response = await requestApi(apiKey, {
    model: slot.type === "ChatGPT" ? "gpt-3.5-turbo" : "gpt-4",
    max_tokens: slot.maxTokens,
    messages,
    stream: true,
    temperature: slot.temperature,
    top_p: slot.topP,
    frequency_penalty: slot.frequencyPenalty,
    presence_penalty: slot.presencePenalty,
  });

  await handleError(response, async () => {
    response = await requestApi(apiKey, {
      model:
        slot.type === "ChatGPT" ? "gpt-3.5-turbo-0125" : "gpt-4-turbo-preview",
      max_tokens: slot.maxTokens,
      messages,
      stream: true,
      temperature: slot.temperature,
      top_p: slot.topP,
      frequency_penalty: slot.frequencyPenalty,
      presence_penalty: slot.presencePenalty,
    });
    await handleError(response);
  });

  const result = await parseResult(response, onDelta);

  return { result };
}

async function handleError(
  response: Response,
  whenContextExceeded?: () => Promise<unknown>
) {
  if (response.status !== 200) {
    const responseError: Error = await response.json();

    if (responseError.error.code === "context_length_exceeded") {
      await whenContextExceeded?.();
      return;
    }

    const error = new Error();
    error.name = responseError.error.type;
    error.message =
      responseError.error.code + responseError.error.message ?? "";
    throw error;
  }
}

async function parseResult(
  response: Response,
  onDelta?: (chunk: string) => unknown
) {
  const reader = response.body
    ?.pipeThrough(new TextDecoderStream())
    .getReader();

  let result = "";
  while (reader) {
    const { value: _value, done } = await reader.read();
    const value = (_value as string).trim();
    if (done) {
      break;
    }
    const lines = value.split("\n\n").filter(Boolean);
    const chunks = lines
      .map((line) => line.substring(5).trim())
      .map(parseToJSON)
      .map((data) => data?.choices.at(0).delta.content)
      .filter(Boolean);

    chunks.forEach((chunk) => {
      result += chunk;
      onDelta?.(chunk);
    });

    if (value.includes("data: [DONE]")) {
      break;
    }
  }
  return result;
}

const parseToJSON = (line: string) => {
  try {
    return JSON.parse(line);
  } catch (e) {
    console.error(e);
    return;
  }
};

async function requestApi(apiKey: string, body: CreateChatCompletionRequest) {
  return fetch("https://api.openai.com/v1/chat/completions", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    method: "POST",
    body: JSON.stringify(body),
  });
}

function hasChats(chats?: Chat[]): chats is Chat[] {
  return chats !== undefined && chats.length > 0;
}

function convertChatsToMessages(chats: Chat[]): ChatCompletionRequestMessage[] {
  return chats
    .filter((chat) => chat.role !== "error")
    .map((chat) => {
      return {
        role: chat.role === "user" ? "user" : "assistant",
        content: chat.content,
      };
    });
}
