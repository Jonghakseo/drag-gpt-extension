import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import { ChromeMessenger } from "@pages/chrome/ChromeMessenger";
import { useMachine } from "@xstate/react";
import hasApiKeyPageStateMachine from "@pages/popup/stateMachine/hasApiKeyPageStateMachine";
import SlotDetail from "@pages/popup/components/SlotDetail";
import StyledButton from "@pages/popup/components/StyledButton";

type SlotListPageProps = {
  onClickChangeApiKey: () => void;
};

export default function SlotListPage({
  onClickChangeApiKey,
}: SlotListPageProps) {
  const [state, send] = useMachine(hasApiKeyPageStateMachine, {
    services: {
      getAllSlots: async () =>
        ChromeMessenger.sendMessageAsync({ type: "GetSlots" }),
    },
    actions: {
      exitPage: onClickChangeApiKey,
    },
  });

  const addNewSlot = () => {
    const newSlot = createNewChatGPTSlot();
    send({
      type: "ADD_SLOT",
      data: newSlot,
    });
    ChromeMessenger.sendMessage({
      message: { type: "AddNewSlot", data: newSlot },
    });
  };

  const selectSlot = (slotId: string) => {
    send({ type: "SELECT_SLOT", slotId });
    ChromeMessenger.sendMessage({
      message: {
        type: "SelectSlot",
        data: slotId,
      },
    });
  };

  const updateSlotData = (slot: Slot) => {
    send({ type: "UPDATE_SLOT", data: slot });
    ChromeMessenger.sendMessage({
      message: {
        type: "UpdateSlotData",
        data: slot,
      },
    });
  };

  const deleteSlot = (slotId: string) => {
    send({ type: "DELETE_SLOT", slotId });
    ChromeMessenger.sendMessage({
      message: {
        type: "DeleteSlot",
        data: slotId,
      },
    });
  };

  return (
    <>
      {state.matches("slot_list") && (
        <VStack spacing={12} width="100%">
          <Text color="antiquewhite" fontWeight="bold">
            Slots
          </Text>
          <HStack width="100%" justifyContent="space-between">
            <StyledButton onClick={addNewSlot}>ADD NEW SLOT</StyledButton>
            <StyledButton onClick={() => send("CHANGE_API_KEY")}>
              CHANGE API KEY
            </StyledButton>
          </HStack>
          {state.context.slots.map((slot, index) => (
            <Box
              key={slot.id}
              width="100%"
              backgroundColor="white"
              cursor="pointer"
              padding={8}
              borderRadius={4}
              border="2px solid"
              borderColor={slot.isSelected ? "#3F75E5FF" : "white"}
              onClick={() => selectSlot(slot.id)}
            >
              <HStack justifyContent="space-between">
                <Text fontWeight="bold">{`${index + 1}. ${slot.name}`}</Text>
                <HStack>
                  <StyledButton
                    onClick={(event) => {
                      event.stopPropagation();
                      send({ type: "SHOW_DETAIL", slotId: slot.id });
                    }}
                  >
                    <Text fontSize={11}>EDIT</Text>
                  </StyledButton>
                  <StyledButton
                    onClick={(event) => {
                      event.stopPropagation();
                      deleteSlot(slot.id);
                    }}
                  >
                    <Text fontSize={11}>DEL</Text>
                  </StyledButton>
                </HStack>
              </HStack>
            </Box>
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
    </>
  );
}

function createNewChatGPTSlot(): Slot {
  return {
    type: "ChatGPT",
    isSelected: true,
    id: generateId(),
    name: "slot",
    assistant: "",
    system: "",
  };
}

function generateId(): string {
  return `${Date.now()}${Math.random()}`;
}
