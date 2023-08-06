import { ILocalStorage, LocalStorage } from "@src/chrome/localStorage";

type SessionId = string;
export type SessionHistories = {
  history: Chat[];
  updatedAt: number;
  createdAt: number;
  type?: "Quick" | "Drag";
};
export type ChatHistories = Record<SessionId, SessionHistories>;

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

  static async getChatHistory(sessionId: string): Promise<SessionHistories> {
    const chatHistories = await this.getChatHistories();
    return (
      chatHistories[sessionId] || {
        history: [],
        updatedAt: 0,
        createdAt: Date.now(),
      }
    );
  }

  static async resetChatHistories(): Promise<void> {
    await this.storage.save(this.CHAT_HISTORY_KEY, EMPTY_CHAT_HISTORIES);
  }

  static async saveChatHistories(
    sessionId: string,
    chatOrChats: Chat | Chat[],
    type: "Quick" | "Drag"
  ): Promise<void> {
    const chatHistories = await this.getChatHistories();
    await this.storage.save(this.CHAT_HISTORY_KEY, {
      ...chatHistories,
      [sessionId]: {
        type,
        history: chatOrChats,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    });
  }

  static async deleteChatHistory(sessionId: string): Promise<void> {
    const chatHistories = await this.getChatHistories();
    delete chatHistories[sessionId];
    await this.storage.save(this.CHAT_HISTORY_KEY, chatHistories);
  }

  static async pushChatHistories(
    sessionId: string,
    chatOrChats: Chat | Chat[],
    type?: "Quick" | "Drag"
  ): Promise<void> {
    const chatHistories = await this.getChatHistories();
    const sessionHistories = await this.getChatHistory(sessionId);
    await this.storage.save(this.CHAT_HISTORY_KEY, {
      ...chatHistories,
      [sessionId]: {
        ...sessionHistories,
        history: sessionHistories.history.concat(chatOrChats),
        updatedAt: Date.now(),
        type: type ? type : sessionHistories.type,
      },
    });
  }
}
