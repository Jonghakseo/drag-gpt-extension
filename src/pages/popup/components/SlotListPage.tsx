import { HStack, Text, VStack } from "@chakra-ui/react";
import { useMachine } from "@xstate/react";
import hasApiKeyPageStateMachine from "@pages/popup/stateMachine/hasApiKeyPageStateMachine";
import SlotDetail from "@pages/popup/components/SlotDetail";
import StyledButton from "@pages/popup/components/StyledButton";
import Footer from "@pages/popup/components/Footer";
import {
  sendMessageToBackground,
  sendMessageToBackgroundAsync,
} from "@pages/chrome/message";
import SlotListItem from "@pages/popup/components/SlotListItem";
import { COLORS } from "@src/constant/style";

type SlotListPageProps = {
  onClickChangeApiKey: () => void;
};

export default function SlotListPage({
  onClickChangeApiKey,
}: SlotListPageProps) {
  const [state, send] = useMachine(hasApiKeyPageStateMachine, {
    services: {
      getAllSlots: async () =>
        sendMessageToBackgroundAsync({
          type: "GetSlots",
        }),
    },
    actions: {
      exitPage: onClickChangeApiKey,
    },
  });

  const addNewSlot = () => {
    const newSlot = createNewChatGPTSlot({
      isSelected: state.context.slots.length === 0,
    });
    send({
      type: "ADD_SLOT",
      data: newSlot,
    });
    sendMessageToBackground({
      message: { type: "AddNewSlot", data: newSlot },
    });
    goToSlotDetail(newSlot.id);
  };

  const selectSlot = (slotId: string) => {
    send({ type: "SELECT_SLOT", slotId });
    sendMessageToBackground({
      message: {
        type: "SelectSlot",
        data: slotId,
      },
    });
  };

  const updateSlotData = (slot: Slot) => {
    send({ type: "UPDATE_SLOT", data: slot });
    sendMessageToBackground({
      message: {
        type: "UpdateSlotData",
        data: slot,
      },
    });
  };

  const deleteSlot = (slotId: string) => {
    send({ type: "DELETE_SLOT", slotId });
    sendMessageToBackground({
      message: {
        type: "DeleteSlot",
        data: slotId,
      },
    });
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
          initialSlot={state.context.selectedSlot as Slot}
          onUpdate={updateSlotData}
          exitDetail={() => send("BACK")}
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
