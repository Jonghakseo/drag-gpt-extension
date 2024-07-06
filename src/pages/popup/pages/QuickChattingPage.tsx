import {
  Button,
  FormLabel,
  HStack,
  Switch,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import StyledButton from "@pages/popup/components/StyledButton";
import { useMachine } from "@xstate/react";
import {
  sendMessageToBackground,
  sendMessageToBackgroundAsync,
} from "@src/chrome/message";
import { FormEventHandler, KeyboardEventHandler } from "react";
import { useScrollDownEffect } from "@src/shared/hook/useScrollDownEffect";
import { t } from "@src/chrome/i18n";
import { useCopyClipboard } from "@src/shared/hook/useCopyClipboard";
import streamChatStateMachine from "@src/shared/xState/streamChatStateMachine";
import { getQuickGPTResponseAsStream } from "@src/shared/services/getGPTResponseAsStream";
import { COLORS } from "@src/constant/style";
import useGeneratedId from "@src/shared/hook/useGeneratedId";
import { ChatBox } from "@pages/content/src/ContentScriptApp/components/messageBox/ResponseMessageBox";

function resetChatHistoriesFromBackground() {
  sendMessageToBackground({
    message: {
      type: "ResetQuickChatHistory",
    },
  });
}

type QuickChattingPageProps = {
  onClickBackButton: () => void;
};

export default function QuickChattingPage({
  onClickBackButton,
}: QuickChattingPageProps) {
  const { id: sessionId, regenerate: regenerateSessionId } =
    useGeneratedId("quick_");
  const [state, send] = useMachine(streamChatStateMachine, {
    services: {
      getChatHistoryFromBackground: () => {
        return sendMessageToBackgroundAsync({
          type: "GetQuickChatHistory",
        });
      },
      getGPTResponse: (context) => {
        return getQuickGPTResponseAsStream({
          isGpt4Turbo: context.isGpt4Turbo,
          messages: context.chats,
          onDelta: (chunk) => {
            send("RECEIVE_ING", { data: chunk });
          },
          onFinish: (result) => send("RECEIVE_DONE", { data: result }),
        });
      },
    },
    actions: {
      exitChatting: onClickBackButton,
      resetChatData: (context) => {
        void sendMessageToBackgroundAsync({
          type: "SaveChatHistory",
          input: { chats: context.chats, sessionId, type: "Quick" },
        });
        context.chats = [];
        regenerateSessionId();
        resetChatHistoriesFromBackground();
      },
    },
  });

  const { scrollDownRef } = useScrollDownEffect([
    state.context.chats.at(-1)?.content,
  ]);
  const { isCopied, copy } = useCopyClipboard([
    state.context.chats.filter(({ role }) => role === "assistant").length,
  ]);

  const onClickCopy = async () => {
    const lastResponseText = findLastResponseChat(state.context.chats);
    if (lastResponseText) {
      await copy(lastResponseText.content);
    }
  };

  const isLoading = state.matches("loading");
  const isReceiving = state.matches("receiving");

  const onChatSubmit: FormEventHandler = (event) => {
    event.preventDefault();
    send({ type: "QUERY" });
  };

  const onClickResetButton = () => {
    send("RESET");
  };

  const onClickStopButton = () => {
    send("RECEIVE_CANCEL");
  };

  const onChatInputKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (
    event
  ) => {
    if (event.nativeEvent.isComposing) {
      return;
    }
    if (event.key === "Enter" && !event.shiftKey) {
      (event.target as HTMLTextAreaElement).form?.requestSubmit();
      event.preventDefault();
    }
  };

  return (
    <VStack w="400px" minH="400px" justifyContent="space-between">
      <HStack w="100%" justifyContent="space-between">
        <StyledButton onClick={onClickBackButton}>
          {t("quickChattingPage_backButtonText")}
        </StyledButton>
        <StyledButton onClick={onClickResetButton}>
          {t("quickChattingPage_resetButtonText")}
        </StyledButton>
      </HStack>
      <VStack
        ref={scrollDownRef}
        spacing={4}
        flexGrow={1}
        w="100%"
        overflowY="scroll"
        maxHeight="300px"
        fontSize={13}
      >
        {state.context.chats.map((chat, index) => (
          <ChatBox chat={chat} key={index} />
        ))}
      </VStack>
      <VStack as="form" onSubmit={onChatSubmit} mt="auto" w="100%">
        <Textarea
          color="black"
          size="xs"
          resize="none"
          width="100%"
          height="50px"
          value={state.context.inputText}
          placeholder={t("quickChattingPage_chattingPlaceholder")}
          onChange={(e) => send({ type: "CHANGE_TEXT", data: e.target.value })}
          onKeyDown={onChatInputKeyDown}
        />
        <HStack justifyContent="space-between" w="100%">
          <HStack>
            <StyledButton onClick={onClickCopy}>
              {isCopied
                ? t("quickChattingPage_copyButtonText_copied")
                : t("quickChattingPage_copyButtonText_copy")}
            </StyledButton>
            <FormLabel
              htmlFor="is-gpt4-switch"
              mb="0"
              color={COLORS.WHITE}
              fontSize={12}
            >
              {t("quickChattingPage_isGpt4")}
            </FormLabel>
            <Switch
              id="is-gpt4-switch"
              isChecked={state.context.isGpt4Turbo}
              onChange={() => send("TOGGLE_IS_GPT4_TURBO")}
            />
          </HStack>
          <HStack justifyContent="end">
            {isReceiving && (
              <Button
                colorScheme="orange"
                size="xs"
                onClick={onClickStopButton}
              >
                {t("quickChattingPage_stopButtonText")}
              </Button>
            )}

            <StyledButton
              type="submit"
              isLoading={isLoading || isReceiving}
              colorScheme="blue"
            >
              {t("quickChattingPage_sendButtonText")}
            </StyledButton>
          </HStack>
        </HStack>
      </VStack>
    </VStack>
  );
}

function findLastResponseChat(chats: Chat[]) {
  return chats.filter((chat) => chat.role === "assistant").at(-1);
}
