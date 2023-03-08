export class SlotsManipulator {
  static getSelectedSlot(slots: Slot[]): Slot | undefined {
    return slots.find(({ isSelected }) => isSelected);
  }

  static addSlot(slots: Slot[], slot: Slot): Slot[] {
    const newSlot: Slot = { ...slot, isSelected: slots.length === 0 };
    return [...slots, newSlot];
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
