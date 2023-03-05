import { Button, HStack, Text, Textarea, VStack } from "@chakra-ui/react";
import React, {
  ChangeEventHandler,
  ReactEventHandler,
  useEffect,
  useState,
} from "react";
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
  role: string;
  assistantPrompt: string;
  onClickChangeApiKey: () => void;
  updateRole: (role: string) => void;
  updateAssistantPrompt: (assistantPrompt: string) => void;
};

export default function HasApiKeyPage({
  role,
  assistantPrompt,
  onClickChangeApiKey,
  updateRole,
  updateAssistantPrompt,
}: HasApiKeyPageProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [_role, onChangeRole] = useInput<HTMLTextAreaElement>(role);
  const [_assistantPrompt, onChangeAssistantPrompt] =
    useInput<HTMLTextAreaElement>(assistantPrompt);

  const saveRoleAndAssistant = () => {
    updateRole(_role);
    updateAssistantPrompt(_assistantPrompt);
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
        value={_role}
        placeholder="ex. You are a code reviewer."
        onChange={onChangeRole}
        size="sm"
      />
      <Text color="antiquewhite">Try adding phrases to help with GPT</Text>
      <StyledTextArea
        fontSize={12}
        resize="none"
        width={220}
        height={50}
        maxLength={200}
        value={_assistantPrompt}
        placeholder="ex. I don't need to explain what this code is. And Please answer only in Korean."
        onChange={onChangeAssistantPrompt}
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

const useInput = <T extends HTMLInputElement | HTMLTextAreaElement>(
  value: string
) => {
  const [_value, setValue] = useState(value);

  useEffect(() => {
    setValue(value);
  }, [value]);

  const onChange: ChangeEventHandler<T> = (event) => {
    setValue(event.target.value);
  };

  return [_value, onChange] as const;
};
