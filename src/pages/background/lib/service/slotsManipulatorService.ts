export class SlotsManipulatorService {
  static getSelectedSlot(slots: Slot[]): Slot | undefined {
    return slots.find(({ isSelected }) => isSelected);
  }

  static getSelectedSlotIndex(slots: Slot[]): number | undefined {
    const index = slots.findIndex(({ isSelected }) => isSelected);
    return index >= 0 ? index : undefined;
  }

  static addSlot(slots: Slot[], slot: Slot): Slot[] {
    return [...slots, slot];
  }

  static updateSlot(slots: Slot[], slot: Slot): Slot[] {
    return slots.reduce<Slot[]>((previousValue, currentValue) => {
      if (currentValue.id === slot.id) {
        return previousValue.concat(slot);
      }
      return previousValue.concat(currentValue);
    }, []);
  }

  static deleteSlot(slots: Slot[], slotId: string): Slot[] {
    return slots.filter((slot) => slot.id !== slotId);
  }
}
