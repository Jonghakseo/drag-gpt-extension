import { HStack, Text, VStack } from "@chakra-ui/react";
import { useMachine } from "@xstate/react";
import hasApiKeyPageStateMachine from "@pages/popup/stateMachine/hasApiKeyPageStateMachine";
import SlotDetail from "@pages/popup/components/SlotDetail";
import StyledButton from "@pages/popup/components/StyledButton";
import Footer from "@pages/popup/components/layout/Footer";
import {
  sendMessageToBackground,
  sendMessageToBackgroundAsync,
} from "@src/chrome/message";
import SlotListItem from "@pages/popup/components/SlotListItem";
import { COLORS } from "@src/constant/style";

const addSlotMessageSendToBackground = (newSlot: Slot) => {
  sendMessageToBackground({
    message: { type: "AddNewSlot", data: newSlot },
  });
};
const updateSlotMessageSendToBackground = (updatedSlot: Slot) => {
  sendMessageToBackground({
    message: {
      type: "UpdateSlotData",
      data: updatedSlot,
    },
  });
};

const selectSlotMessageSendToBackground = (slotId: string) => {
  sendMessageToBackground({
    message: { type: "SelectSlot", data: slotId },
  });
};

const deleteSlotMessageSendToBackground = (slotId: string) => {
  sendMessageToBackground({
    message: {
      type: "DeleteSlot",
      data: slotId,
    },
  });
};

type SlotListPageProps = {
  onClickChangeApiKey: () => void;
};

export default function SlotListPage({
  onClickChangeApiKey,
}: SlotListPageProps) {
  const [state, send] = useMachine(hasApiKeyPageStateMachine, {
    services: {
      getAllSlots: async () => {
        return await sendMessageToBackgroundAsync({
          type: "GetSlots",
        });
      },
    },
    actions: {
      exitPage: onClickChangeApiKey,
      deleteSlotMessageSendToBackground: (_, event) => {
        deleteSlotMessageSendToBackground(event.slotId);
      },
      updateSlotMessageSendToBackground: (_, event) => {
        updateSlotMessageSendToBackground(event.slot);
      },
      selectSlotMessageSendToBackground: (_, event) => {
        selectSlotMessageSendToBackground(event.slotId);
      },
      addSlotMessageSendToBackground: (_, event) => {
        addSlotMessageSendToBackground(event.slot);
      },
    },
  });

  const addNewSlot = () => {
    const newSlot = createNewChatGPTSlot();
    send({
      type: "ADD_SLOT",
      slot: newSlot,
    });
    goToSlotDetail(newSlot.id);
  };

  const selectSlot = (slotId: string) => {
    send({ type: "SELECT_SLOT", slotId });
  };

  const updateSlotData = (slot: Slot) => {
    send({ type: "UPDATE_SLOT", slot });
  };

  const deleteSlot = (slotId: string) => {
    send({ type: "DELETE_SLOT", slotId });
  };

  const goToSlotDetail = (slotId: string) => {
    send({ type: "SHOW_DETAIL", slotId });
  };

  return (
    <>
      {state.matches("slot_list") && (
        <VStack spacing={12} width="100%">
          <Text color={COLORS.WHITE} fontWeight="bold">
            Slots
          </Text>
          <HStack width="100%" justifyContent="space-between">
            <StyledButton onClick={addNewSlot}>ADD NEW SLOT</StyledButton>
            <StyledButton onClick={() => send("CHANGE_API_KEY")}>
              CHANGE API KEY
            </StyledButton>
          </HStack>
          {state.context.slots.map((slot, index) => (
            <SlotListItem
              key={slot.id}
              slotName={`${index + 1}. ${slot.name || slot.type}`}
              isSelected={slot.isSelected}
              onSelect={() => selectSlot(slot.id)}
              onDetail={() => goToSlotDetail(slot.id)}
              onDelete={() => deleteSlot(slot.id)}
            />
          ))}
        </VStack>
      )}
      {state.matches("slot_detail") && (
        <SlotDetail
          initialSlot={state.context.editingSlot as Slot}
          onUpdate={updateSlotData}
          exitDetail={() => send("EXIT_DETAIL")}
        />
      )}
      <Footer />
    </>
  );
}

function createNewChatGPTSlot(config?: Partial<Slot>): Slot {
  return {
    type: "ChatGPT",
    isSelected: false,
    id: generateId(),
    name: "",
    ...config,
  };
}

function generateId(): string {
  return `${Date.now()}${Math.random()}`;
}
