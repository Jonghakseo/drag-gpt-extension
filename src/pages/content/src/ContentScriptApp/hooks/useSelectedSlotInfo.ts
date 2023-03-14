import { useState } from "react";
import { sendMessageToBackgroundAsync } from "@src/chrome/message";
import { SlotsManipulatorService } from "@pages/background/lib/service/slotsManipulatorService";
import { useInterval } from "@chakra-ui/react";

export default function useSelectedSlot(pollIntervalMs = 1500) {
  const [selectedSlot, setSelectedSlot] = useState<Slot | undefined>(
    loadSelectedSlotFromSessionStorage
  );

  const saveSelectedSlot = (selectedSlot: Slot) => {
    saveSelectedSlotToSessionStorage(selectedSlot);
    setSelectedSlot(selectedSlot);
  };

  const getSelectedSlot = async (): Promise<Slot | undefined> => {
    try {
      const slots = await sendMessageToBackgroundAsync({ type: "GetSlots" });
      return SlotsManipulatorService.getSelectedSlot(slots);
    } catch (e) {
      return undefined;
    }
  };

  useInterval(() => {
    getSelectedSlot().then((selectedSlot) => {
      selectedSlot && saveSelectedSlot(selectedSlot);
    });
  }, pollIntervalMs);

  return selectedSlot;
}

const SLOT_ORDER_KEY = "__slotOrder" as const;
const saveSelectedSlotToSessionStorage = (selectedSlot: Slot) => {
  window.sessionStorage.setItem(SLOT_ORDER_KEY, JSON.stringify(selectedSlot));
};
const loadSelectedSlotFromSessionStorage = (): Slot | undefined => {
  const savedSlotInfo = window.sessionStorage.getItem(SLOT_ORDER_KEY);
  if (!savedSlotInfo) {
    return undefined;
  }
  return JSON.parse(savedSlotInfo) as Slot;
};
