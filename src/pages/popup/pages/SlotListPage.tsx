import { HStack, Text, VStack } from "@chakra-ui/react";
import { useMachine } from "@xstate/react";
import slotListPageStateMachine from "@pages/popup/stateMachine/slotListPageStateMachine";
import SlotDetail from "@pages/popup/components/SlotDetail";
import StyledButton from "@pages/popup/components/StyledButton";
import Footer from "@pages/popup/components/layout/Footer";
import {
  sendMessageToBackground,
  sendMessageToBackgroundAsync,
} from "@src/chrome/message";
import SlotListItem from "@pages/popup/components/SlotListItem";
import { COLORS } from "@src/constant/style";

const getAllSlotsFromBackground = async () => {
  return await sendMessageToBackgroundAsync({
    type: "GetSlots",
  });
};

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
  onClickQuickChatButton: () => void;
};

export default function SlotListPage({
  onClickChangeApiKey,
  onClickQuickChatButton,
}: SlotListPageProps) {
  const [state, send] = useMachine(slotListPageStateMachine, {
    services: {
      getAllSlotsFromBackground,
    },
    actions: {
      exitPage: onClickChangeApiKey,
      deleteSlotMessageSendToBackground: (_, event) => {
        deleteSlotMessageSendToBackground(event.data);
      },
      updateSlotMessageSendToBackground: (_, event) => {
        updateSlotMessageSendToBackground(event.data);
      },
      selectSlotMessageSendToBackground: (_, event) => {
        selectSlotMessageSendToBackground(event.data);
      },
      addSlotMessageSendToBackground: (_, event) => {
        addSlotMessageSendToBackground(event.data);
      },
    },
  });

  const addNewSlot = () => {
    const newSlot = createNewChatGPTSlot();
    send({
      type: "ADD_SLOT",
      data: newSlot,
    });
    goToSlotDetail(newSlot.id);
  };

  const selectSlot = (slotId: string) => {
    send({ type: "SELECT_SLOT", data: slotId });
  };

  const updateSlotData = (slot: Slot) => {
    send({ type: "UPDATE_SLOT", data: slot });
  };

  const deleteSlot = (slotId: string) => {
    send({ type: "DELETE_SLOT", data: slotId });
  };

  const goToSlotDetail = (slotId: string) => {
    send({ type: "SHOW_DETAIL", data: slotId });
  };

  const onClickResetButton = () => {
    if (confirm("Are you sure?")) {
      send("CHANGE_API_KEY");
    }
  };

  return (
    <>
      {state.matches("slot_list") && (
        <VStack spacing={12} width="100%">
          <Text color={COLORS.WHITE} fontWeight="bold">
            Slots
          </Text>
          <HStack width="100%" justifyContent="space-between">
            <StyledButton onClick={addNewSlot}>NEW SLOT</StyledButton>
            <StyledButton onClick={onClickQuickChatButton}>
              QUICK CHAT
            </StyledButton>
            <StyledButton onClick={onClickResetButton}>
              RESET API KEY
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
