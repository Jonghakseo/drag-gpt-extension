import { OpenAI } from "openai";
import { ChatCompletionMessageParam } from "openai/resources";

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
  const messages: ChatCompletionMessageParam[] = [];

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

  const client = new OpenAI({ apiKey });

  const stream = client.beta.chat.completions
    .stream({
      messages,
      model: slot.type === "gpt4-turbo" ? "gpt-4-turbo" : "gpt-4o",
      max_tokens: slot.maxTokens,
      temperature: slot.temperature,
      top_p: slot.topP,
      frequency_penalty: slot.frequencyPenalty,
      presence_penalty: slot.presencePenalty,
      stream: true,
    })
    .on("content", (content) => {
      onDelta?.(content);
    });

  const result = await stream.finalChatCompletion();
  return { result: result.choices.at(0)?.message.content ?? "" };
}

function hasChats(chats?: Chat[]): chats is Chat[] {
  return chats !== undefined && chats.length > 0;
}

function convertChatsToMessages(chats: Chat[]) {
  return chats
    .filter((chat) => chat.role !== "error")
    .map((chat) => {
      return {
        role: chat.role === "user" ? "user" : "assistant",
        content: chat.content,
      } as const;
    });
}
