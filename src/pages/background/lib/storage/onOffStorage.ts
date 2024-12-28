import { ILocalStorage, LocalStorage } from "@src/chrome/localStorage";

export class OnOffStorage {
  private static KEY = "ON_OFF";
  static storage: ILocalStorage = new LocalStorage();

  static async getOnOff(): Promise<boolean> {
    try {
      const onOff = await this.storage.load(this.KEY);
      return Boolean(onOff);
    } catch {
      await this.storage.save(this.KEY, false);
      return false;
    }
  }

  static async toggle() {
    const onOff = await this.storage.load(this.KEY);
    await this.storage.save(this.KEY, !onOff);
  }
}
