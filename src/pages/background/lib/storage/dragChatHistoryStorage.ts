import { ILocalStorage, LocalStorage } from "@src/chrome/localStorage";

export class DragChatHistoryStorage {
  private static DRAG_CHAT_HISTORY = "DRAG_CHAT_HISTORY";
  static storage: ILocalStorage = new LocalStorage();

  static async getChatHistories(): Promise<Chat[]> {
    try {
      const chatHistories = await this.storage.load(this.DRAG_CHAT_HISTORY);
      if (Array.isArray(chatHistories)) {
        return chatHistories as Chat[];
      }
    } catch (e) {
      return [];
    }
    return [];
  }

  static async resetChatHistories(): Promise<void> {
    await this.storage.save(this.DRAG_CHAT_HISTORY, []);
  }

  static async pushChatHistories(chatOrChats: Chat | Chat[]): Promise<void> {
    const chats = await this.getChatHistories();
    await this.storage.save(this.DRAG_CHAT_HISTORY, chats.concat(chatOrChats));
  }
}
