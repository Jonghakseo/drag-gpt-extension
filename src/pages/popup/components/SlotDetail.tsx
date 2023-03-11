import { HStack, Input, Text, Textarea, VStack } from "@chakra-ui/react";
import React, { useState } from "react";
import styled from "@emotion/styled";
import StyledButton from "@pages/popup/components/StyledButton";
import { COLORS } from "@src/constant/style";
import { t } from "@src/chrome/i18n";

const StyledTextArea = styled(Textarea)`
  padding: 4px;
`;

type SlotDetailProps = {
  initialSlot: Slot;
  onUpdate: (slot: Slot) => void;
  exitDetail: () => void;
};

export default function SlotDetail({
  initialSlot,
  onUpdate,
  exitDetail,
}: SlotDetailProps) {
  const [slot, setSlot] = useState(initialSlot);

  const onSaveButtonClick = () => {
    onUpdate(slot);
    exitDetail();
  };

  const updateSlot = (key: keyof Slot, value: Slot[keyof Slot]) => {
    setSlot((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };

  return (
    <VStack spacing={12} alignItems="flex-start">
      <Text color={COLORS.WHITE} fontSize={12}>
        {t("slotDetail_promptSlotName")}
      </Text>
      <Input
        fontSize={12}
        value={slot.name}
        placeholder="ex. Code Review"
        onChange={(event) => {
          updateSlot("name", event.target.value);
        }}
      />
      <Text color={COLORS.WHITE} fontSize={12}>
        {t("slotDetail_writePromptTitle")}
      </Text>
      <StyledTextArea
        fontSize={12}
        resize="none"
        width={220}
        height={70}
        maxLength={2000}
        value={slot.system}
        placeholder={t("slotDetail_promptInputPlaceholder")}
        onChange={(event) => {
          updateSlot("system", event.target.value);
        }}
        size="xs"
      />
      <HStack paddingTop={4} width="100%" justifyContent="space-evenly">
        <StyledButton onClick={onSaveButtonClick}>
          {t("slotDetail_saveButtonText")}
        </StyledButton>
        <StyledButton onClick={exitDetail}>
          {t("slotDetail_backButtonText")}
        </StyledButton>
      </HStack>
    </VStack>
  );
}
