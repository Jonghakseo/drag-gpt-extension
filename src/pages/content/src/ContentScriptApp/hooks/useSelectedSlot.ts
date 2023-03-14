import { useState } from "react";
import { sendMessageToBackgroundAsync } from "@src/chrome/message";
import { SlotsManipulatorService } from "@pages/background/lib/service/slotsManipulatorService";
import { useInterval } from "@chakra-ui/react";

export default function useSelectedSlot(pollIntervalMs = 1500) {
  const [selectedSlot, setSelectedSlot] = useState<Slot | undefined>();

  const getSelectedSlot = async (): Promise<Slot | undefined> => {
    if (window.document.hidden) {
      return;
    }

    try {
      const slots = await sendMessageToBackgroundAsync({ type: "GetSlots" });
      return SlotsManipulatorService.getSelectedSlot(slots);
    } catch (e) {
      return undefined;
    }
  };

  useInterval(() => {
    getSelectedSlot().then(setSelectedSlot);
  }, pollIntervalMs);

  return selectedSlot;
}
