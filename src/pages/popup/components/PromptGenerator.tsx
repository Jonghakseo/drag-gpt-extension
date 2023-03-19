import { HStack, Text, Textarea, VStack } from "@chakra-ui/react";
import StyledButton from "@pages/popup/components/StyledButton";
import { t } from "@src/chrome/i18n";
import { COLORS } from "@src/constant/style";
import { useMachine } from "@xstate/react";
import promptGeneratorStateMachine from "@pages/popup/xState/promptGeneratorStateMachine";
import { sendMessageToBackgroundAsync } from "@src/chrome/message";

type PromptGeneratorProps = {
  exit: () => void;
};

const getGeneratedPromptFromBackground = async (inputText: string) => {
  const data = await sendMessageToBackgroundAsync({
    type: "RequestGenerateChatGPTPrompt",
    input: inputText,
  });
  return data.result;
};

export default function PromptGenerator({ exit }: PromptGeneratorProps) {
  const [state, send] = useMachine(promptGeneratorStateMachine, {
    context: {
      inputText: t("promptGenerator_placeholder"),
    },
    services: {
      getGeneratedPrompt: (context) =>
        getGeneratedPromptFromBackground(context.inputText),
    },
  });
  const isLoading = state.matches("loading");

  return (
    <VStack>
      <HStack w="100%" justifyContent="space-between">
        <StyledButton onClick={exit}>
          {t("promptGenerator_backButton")}
        </StyledButton>
      </HStack>
      <Text
        color={COLORS.WHITE}
        fontSize={12}
        lineHeight={1.2}
        textAlign="start"
        w="100%"
      >
        {t("promptGenerator_guideMessage")}
      </Text>
      <Textarea
        width="100%"
        height="80px"
        size="xs"
        lineHeight={1.2}
        value={state.context.inputText}
        placeholder={t("promptGenerator_placeholder")}
        onChange={(e) =>
          send({ type: "UPDATE_INPUT_TEXT", data: e.target.value })
        }
      />
      {state.context.outputPrompt && (
        <Textarea
          width="100%"
          size="xs"
          height="80px"
          lineHeight={1.2}
          value={state.context.outputPrompt}
        />
      )}
      {state.context.error && (
        <Text color={COLORS.RED}>
          {state.context.error.name}:{state.context.error.message}
        </Text>
      )}
      <HStack w="100%" justifyContent="space-between">
        <StyledButton
          onClick={() => send("GENERATE")}
          colorScheme="blue"
          isLoading={isLoading}
        >
          {t("promptGenerator_generateButton")}
        </StyledButton>
      </HStack>
    </VStack>
  );
}
