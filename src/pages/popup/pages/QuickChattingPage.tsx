import { HStack, Textarea, VStack } from "@chakra-ui/react";
import StyledButton from "@pages/popup/components/StyledButton";
import { useMachine } from "@xstate/react";
import { ChatCompletionRequestMessage } from "openai";
import {
  sendMessageToBackground,
  sendMessageToBackgroundAsync,
} from "@src/chrome/message";
import { FormEventHandler, KeyboardEventHandler } from "react";
import UserChat from "@src/shared/component/UserChat";
import ChatText from "@src/shared/component/ChatText";
import AssistantChat from "@src/shared/component/AssistantChat";
import { useScrollDownEffect } from "@src/shared/hook/useScrollDownEffect";
import { t } from "@src/chrome/i18n";
import { useCopyClipboard } from "@src/shared/hook/useCopyClipboard";
import streamChatStateMachine from "@src/shared/xState/streamChatStateMachine";
import { getQuickGPTResponseAsStream } from "@src/shared/services/getGPTResponseAsStream";

async function getChatHistoryFromBackground() {
  return await sendMessageToBackgroundAsync({
    type: "GetQuickChatHistory",
  });
}
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
  const [state, send] = useMachine(streamChatStateMachine, {
    services: {
      getChatHistoryFromBackground,
      getGPTResponse: (context) => {
        return getQuickGPTResponseAsStream({
          messages: context.chats.filter(
            (chat) => chat.role !== "error"
          ) as ChatCompletionRequestMessage[],
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
        context.chats = [];
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
        {state.context.chats.map((chat, index) => {
          switch (chat.role) {
            case "user":
              return (
                <UserChat
                  key={index}
                  style={{
                    marginInlineStart: "16px",
                  }}
                >
                  <ChatText>{chat.content}</ChatText>
                </UserChat>
              );
            case "assistant":
              return (
                <AssistantChat
                  key={index}
                  style={{
                    marginInlineEnd: "16px",
                  }}
                >
                  <ChatText>{chat.content}</ChatText>
                </AssistantChat>
              );
            case "error":
              return (
                <AssistantChat key={index}>
                  <ChatText isError>{chat.content}</ChatText>
                </AssistantChat>
              );
          }
        })}
      </VStack>
      <VStack as="form" onSubmit={onChatSubmit} mt="auto" w="100%">
        <Textarea
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
          <StyledButton onClick={onClickCopy}>
            {isCopied
              ? t("quickChattingPage_copyButtonText_copied")
              : t("quickChattingPage_copyButtonText_copy")}
          </StyledButton>
          <HStack>
            {isReceiving && (
              <StyledButton colorScheme="orange" onClick={onClickStopButton}>
                {t("quickChattingPage_stopButtonText")}
              </StyledButton>
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
