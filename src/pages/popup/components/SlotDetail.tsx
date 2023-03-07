import { HStack, Input, Text, Textarea, VStack } from "@chakra-ui/react";
import React, { useState } from "react";
import styled from "@emotion/styled";
import StyledButton from "@pages/popup/components/StyledButton";
import Footer from "@pages/popup/components/Footer";

const StyledTextArea = styled(Textarea)`
  padding: 4px;
  &:focus-visible {
    transition: outline-offset 75ms ease-out;
    outline-offset: 4px;
  }
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
      <Text color="antiquewhite" fontSize={11}>
        Slot name
      </Text>
      <Input
        value={slot.name}
        placeholder="Code Review"
        onChange={(event) => {
          updateSlot("name", event.target.value);
        }}
      />
      <Text color="antiquewhite" fontSize={11}>
        Explain the role of GPT
      </Text>
      <StyledTextArea
        fontSize={12}
        resize="none"
        width={220}
        maxLength={200}
        value={slot.system}
        placeholder="ex. You are a code reviewer."
        onChange={(event) => {
          updateSlot("system", event.target.value);
        }}
        size="xs"
      />
      <Text color="antiquewhite" fontSize={11}>
        Try adding phrases to help with GPT
      </Text>
      <StyledTextArea
        fontSize={12}
        resize="none"
        width={220}
        height={50}
        maxLength={200}
        value={slot.assistant}
        placeholder="ex. I don't need to explain what this code is. And Please answer only in Korean."
        onChange={(event) => {
          updateSlot("assistant", event.target.value);
        }}
        size="sm"
      />
      <HStack paddingTop={4} width="100%" justifyContent="space-evenly">
        <StyledButton onClick={onSaveButtonClick}>SAVE</StyledButton>
        <StyledButton onClick={exitDetail}>BACK</StyledButton>
      </HStack>
      <Footer />
    </VStack>
  );
}
