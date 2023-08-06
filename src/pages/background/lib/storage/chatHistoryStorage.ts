import { ILocalStorage, LocalStorage } from "@src/chrome/localStorage";

type ChatHistories = Record<string, Chat[]>;

const EMPTY_CHAT_HISTORIES: ChatHistories = {};

export class ChatHistoryStorage {
  private static CHAT_HISTORY_KEY = "CHAT_HISTORY";
  static storage: ILocalStorage = new LocalStorage();

  static async getChatHistories(): Promise<ChatHistories> {
    try {
      return (await this.storage.load(this.CHAT_HISTORY_KEY)) as ChatHistories;
    } catch (e) {
      return EMPTY_CHAT_HISTORIES;
    }
  }

  static async getChatHistory(sessionId: string): Promise<Chat[]> {
    const chatHistories = await this.getChatHistories();
    return chatHistories[sessionId] || [];
  }

  static async resetChatHistories(): Promise<void> {
    await this.storage.save(this.CHAT_HISTORY_KEY, EMPTY_CHAT_HISTORIES);
  }

  static async pushChatHistories(
    sessionId: string,
    chatOrChats: Chat | Chat[]
  ): Promise<void> {
    const chats = await this.getChatHistories();
    await this.storage.save(this.CHAT_HISTORY_KEY, {
      ...chats,
      [sessionId]: chats[sessionId]
        ? chats[sessionId].concat(chatOrChats)
        : [chatOrChats],
    });
  }
}
