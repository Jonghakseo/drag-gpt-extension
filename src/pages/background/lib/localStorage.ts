import { SlotsManipulator } from "@pages/background/lib/slotsManipulator";

export class LocalStorage {
  private static API_KEY = "OPEN_AI_API_KEY";
  private static SLOTS = "SLOTS";

  static async save(key: string, value: unknown): Promise<void> {
    return chrome.storage.local.set({ [key]: value });
  }

  static async load(key: string): Promise<unknown> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get([key], (result) => {
        const value = result[key];
        if (value === null || value === undefined) {
          const notFoundError = new Error();
          notFoundError.name = "Not Found API Key";
          notFoundError.message =
            "The api key could not be found. Register or change your key";
          reject(notFoundError);
        } else {
          resolve(value);
        }
      });
    });
  }

  static async getApiKey(): Promise<string> {
    const apiKey = await this.load(this.API_KEY);
    return apiKey as string;
  }
  static async setApiKey(apiKey: string | null): Promise<void> {
    await this.save(this.API_KEY, apiKey);
  }

  static async resetAll(): Promise<void> {
    await chrome.storage.local.clear();
  }

  static async getAllSlots(): Promise<Slot[]> {
    try {
      const slots = await this.load(this.SLOTS);
      if (Array.isArray(slots)) {
        return slots as Slot[];
      }
    } catch (e) {
      return [];
    }
    return [];
  }

  static async setAllSlots(slots: Slot[]): Promise<Slot[]> {
    await this.save(this.SLOTS, slots);
    return slots;
  }

  static async getSelectedSlot(): Promise<Slot> {
    const slots = await this.getAllSlots();
    const selectedSlot = SlotsManipulator.getSelectedSlot(slots);
    if (selectedSlot) {
      return selectedSlot;
    }
    const notFoundError = new Error();
    notFoundError.name = "Not found selected slot";
    notFoundError.message = "Check selected slot on popup window.";
    throw notFoundError;
  }

  static async addSlot(slot: Slot): Promise<Slot[]> {
    const slots: Slot[] = await this.getAllSlots();
    const addedSlots = SlotsManipulator.addSlot(slots, slot);
    await this.save(this.SLOTS, addedSlots);
    return addedSlots;
  }

  static async updateSlot(slot: Slot): Promise<Slot[]> {
    const slots = await this.getAllSlots();
    const updatedSlots = SlotsManipulator.updateSlot(slots, slot);
    await this.save(this.SLOTS, updatedSlots);
    return updatedSlots;
  }

  static async deleteSlot(slotId: string): Promise<Slot[]> {
    const slots = await this.getAllSlots();
    const deletedSlots = SlotsManipulator.deleteSlot(slots, slotId);
    await this.save(this.SLOTS, deletedSlots);
    return deletedSlots;
  }
}
