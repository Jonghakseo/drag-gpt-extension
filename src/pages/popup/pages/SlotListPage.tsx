import { Button, HStack, Link, Switch, Text, VStack } from "@chakra-ui/react";
import { useMachine } from "@xstate/react";
import slotListPageStateMachine from "@pages/popup/xState/slotListPageStateMachine";
import SlotDetail from "@pages/popup/components/SlotDetail";
import Footer from "@pages/popup/components/layout/Footer";
import {
  sendMessageToBackground,
  sendMessageToBackgroundAsync,
} from "@src/chrome/message";
import SlotListItem from "@pages/popup/components/SlotListItem";
import { COLORS } from "@src/constant/style";
import { createNewChatGPTSlot } from "@src/shared/slot/createNewChatGPTSlot";
import { t } from "@src/chrome/i18n";
import { useEffect, useState } from "react";
import { OnOffStorage } from "@pages/background/lib/storage/onOffStorage";

const getAllSlotsFromBackground = async () => {
  return await sendMessageToBackgroundAsync({
    type: "GetSlots",
  });
};

const addSlotMessageSendToBackground = (newSlot: Slot) => {
  sendMessageToBackground({
    message: { type: "AddNewSlot", input: newSlot },
  });
};
const updateSlotMessageSendToBackground = (updatedSlot: Slot) => {
  sendMessageToBackground({
    message: {
      type: "UpdateSlot",
      input: updatedSlot,
    },
  });
};

const selectSlotMessageSendToBackground = (slotId: string) => {
  sendMessageToBackground({
    message: { type: "SelectSlot", input: slotId },
  });
};

const deleteSlotMessageSendToBackground = (slotId: string) => {
  sendMessageToBackground({
    message: {
      type: "DeleteSlot",
      input: slotId,
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
    send({ type: "EDIT_SLOT", data: slotId });
  };

  const onClickResetButton = () => {
    if (confirm(t("slotListPage_resetApiKeyConfirmMessage"))) {
      send("CHANGE_API_KEY");
    }
  };

  return (
    <>
      {state.matches("slot_list") && (
        <VStack spacing={3} width="100%">
          <HStack width="100%">
            <Button colorScheme="gray" size="xs" onClick={addNewSlot}>
              {t("slotListPage_newSlotButtonText")}
            </Button>
            <Button
              colorScheme="gray"
              size="xs"
              onClick={onClickQuickChatButton}
            >
              {t("slotListPage_quickChatButtonText")}
            </Button>
            <Button colorScheme="gray" size="xs" onClick={onClickResetButton}>
              {t("slotListPage_resetApiKeyButtonText")}
            </Button>
            <Button
              colorScheme="gray"
              size="xs"
              onClick={() => chrome.runtime.openOptionsPage()}
            >
              {t("slogListPage_showChatHistoryButtonText")}
            </Button>
            <OnOffSwitch />
          </HStack>
          <HStack justifyContent="space-between" w="100%">
            <Text color={COLORS.WHITE} fontWeight="bold">
              {t("slotListPage_promptSlotsTitle")}
            </Text>
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
          exitDetail={() => send("BACK_TO_LIST")}
        />
      )}
      <Footer />
    </>
  );
}

const OnOffSwitch = () => {
  const [isOn, setIsOn] = useState<boolean | null>(null);

  useEffect(() => {
    OnOffStorage.getOnOff().then((onOff) => {
      setIsOn(onOff);
    });
  }, []);

  if (isOn === null) {
    return null;
  }

  return (
    <Switch
      isChecked={isOn}
      onChange={() => {
        OnOffStorage.toggle().then(() => {
          setIsOn(!isOn);
        });
      }}
    />
  );
};
