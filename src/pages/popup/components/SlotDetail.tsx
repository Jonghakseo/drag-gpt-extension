import { HStack, Input, Text, Textarea, VStack } from "@chakra-ui/react";
import React, { useState } from "react";
import styled from "@emotion/styled";
import StyledButton from "@pages/popup/components/StyledButton";

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
      <Text color="antiquewhite" fontSize={14}>
        Prompt Slot name
      </Text>
      <Input
        fontSize={12}
        value={slot.name}
        placeholder="ex. Code Review"
        onChange={(event) => {
          updateSlot("name", event.target.value);
        }}
      />
      <Text color="antiquewhite" fontSize={14}>
        Write a prompt for chat gpt
      </Text>
      <StyledTextArea
        fontSize={12}
        resize="none"
        width={220}
        height={70}
        maxLength={2000}
        value={slot.system}
        placeholder="ex. You are a code reviewer."
        onChange={(event) => {
          updateSlot("system", event.target.value);
        }}
        size="xs"
      />
      <HStack paddingTop={4} width="100%" justifyContent="space-evenly">
        <StyledButton onClick={onSaveButtonClick}>SAVE</StyledButton>
        <StyledButton onClick={exitDetail}>BACK</StyledButton>
      </HStack>
    </VStack>
  );
}
