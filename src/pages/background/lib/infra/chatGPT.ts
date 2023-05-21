import type {
  ChatCompletionRequestMessage,
  CreateChatCompletionRequest,
} from "openai";

export async function chatGPT({
  input,
  slot,
  chats,
  apiKey,
  onDelta,
}: {
  slot: ChatGPTSlot;
  chats?: ChatCompletionRequestMessage[];
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
    messages.push(...chats);
  }
  if (input) {
    messages.push({ role: "user", content: input });
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    method: "POST",
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      max_tokens: slot.maxTokens,
      messages,
      stream: true,
      temperature: slot.temperature,
      top_p: slot.topP,
      frequency_penalty: slot.frequencyPenalty,
      presence_penalty: slot.presencePenalty,
    } as CreateChatCompletionRequest),
  });

  const reader = response.body
    ?.pipeThrough(new TextDecoderStream())
    .getReader();

  let result = "";
  while (reader) {
    const { value, done } = await reader.read();
    if (done) {
      break;
    }
    if (value.includes("data: [DONE]")) {
      break;
    }
    const lines = value.split("\n\n").filter(Boolean);
    const chunks = lines
      .map((line) => line.substring(5).trim())
      .map((line) => JSON.parse(line))
      .map((data) => data.choices.at(0).delta.content)
      .filter(Boolean);

    chunks.forEach((chunk) => {
      result += chunk;
      onDelta?.(chunk);
    });
  }

  return {
    result,
  };
}

function hasChats(
  chats?: ChatCompletionRequestMessage[]
): chats is ChatCompletionRequestMessage[] {
  return chats !== undefined && chats.length > 0;
}
