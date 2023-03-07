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
    return await findSelectedSlot(slots);
  }

  static async addSlot(slot: Slot): Promise<Slot[]> {
    const slots: Slot[] = await this.getAllSlots();
    const updatedSlots = slots.concat(slot);
    await this.save(this.SLOTS, updatedSlots);
    return updatedSlots;
  }

  static async updateSlot(slot: Slot): Promise<Slot[]> {
    const slots = await this.getAllSlots();
    const updatedSlots = slots.reduce<Slot[]>((previousValue, currentValue) => {
      if (currentValue.id === slot.id) {
        return previousValue.concat(slot);
      }
      return previousValue.concat(currentValue);
    }, []);
    await this.save(this.SLOTS, updatedSlots);
    return updatedSlots;
  }

  static async deleteSlot(slotId: string): Promise<Slot[]> {
    const slots = await this.getAllSlots();
    const updatedSlots = slots.filter((slot) => slot.id !== slotId);
    await this.save(this.SLOTS, updatedSlots);
    return updatedSlots;
  }
}

async function findSelectedSlot(slots: Slot[]): Promise<Slot> {
  return new Promise((resolve, reject) => {
    const found = slots.find(({ isSelected }) => isSelected);
    if (found) {
      resolve(found);
    } else {
      reject(Error("Not found selected slot"));
    }
  });
}
