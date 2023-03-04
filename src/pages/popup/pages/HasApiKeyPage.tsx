import { Button, HStack, Text, Textarea, VStack } from "@chakra-ui/react";
import React, { useState } from "react";
import { ChromeMessenger } from "@pages/chrome/ChromeMessenger";
import styled from "@emotion/styled";

const StyledTextArea = styled(Textarea)`
  padding: 4px;
  &:focus-visible {
    transition: outline-offset 75ms ease-out;
    outline-offset: 4px;
  }
`;

const StyledButton = styled(Button)`
  cursor: pointer;
  outline: none;
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  font-weight: bold;

  &:active {
    transform: scale(0.95);
    transition: all ease-in-out 100ms;
  }
`;

type HasApiKeyPageProps = {
  initialRole: string;
  initialAssistantPrompt: string;
  onClickChangeApiKey: () => void;
};

export default function HasApiKeyPage({
  initialRole,
  initialAssistantPrompt,
  onClickChangeApiKey,
}: HasApiKeyPageProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [role, setRole] = useState(initialRole);
  const [assistantPrompt, setAssistantPrompt] = useState(
    initialAssistantPrompt
  );

  const saveRoleAndAssistant = () => {
    ChromeMessenger.sendMessage({
      message: { type: "SetRole", data: role },
    });
    ChromeMessenger.sendMessage({
      message: { type: "SetAssistantPrompt", data: assistantPrompt },
    });
    setIsSaved(true);
  };

  return (
    <VStack spacing={12}>
      <Text color="antiquewhite">Explain the role of GPT</Text>
      <StyledTextArea
        fontSize={12}
        resize="none"
        width={220}
        maxLength={200}
        value={role}
        placeholder="ex. You are a code reviewer."
        onChange={(event) => setRole(event.target.value)}
        size="sm"
      />
      <Text color="antiquewhite">Try adding phrases to help with GPT</Text>
      <StyledTextArea
        fontSize={12}
        resize="none"
        width={220}
        height={50}
        maxLength={200}
        value={assistantPrompt}
        placeholder="ex. I don't need to explain what this code is. And Please answer only in Korean."
        onChange={(event) => setAssistantPrompt(event.target.value)}
        size="sm"
      />
      <HStack marginTop={24}>
        <StyledButton onClick={saveRoleAndAssistant}>
          {isSaved ? "SAVED!" : "SAVE"}
        </StyledButton>
        <StyledButton onClick={onClickChangeApiKey}>
          CHANGE API KEY
        </StyledButton>
      </HStack>
    </VStack>
  );
}
