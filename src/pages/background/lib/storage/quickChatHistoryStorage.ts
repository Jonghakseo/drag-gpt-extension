import { ILocalStorage, LocalStorage } from "@src/chrome/localStorage";

export class QuickChatHistoryStorage {
  private static QUICK_CHAT_HISTORY = "QUICK_CHAT_HISTORY";
  static storage: ILocalStorage = new LocalStorage();

  static async getChatHistories(): Promise<Chat[]> {
    try {
      const chatHistories = await this.storage.load(this.QUICK_CHAT_HISTORY);
      if (Array.isArray(chatHistories)) {
        return chatHistories as Chat[];
      }
    } catch (e) {
      return [];
    }
    return [];
  }

  static async resetChatHistories(): Promise<void> {
    await this.storage.save(this.QUICK_CHAT_HISTORY, []);
  }

  static async pushChatHistories(chatOrChats: Chat | Chat[]): Promise<void> {
    const chats = await this.getChatHistories();
    await this.storage.save(this.QUICK_CHAT_HISTORY, chats.concat(chatOrChats));
  }
}
