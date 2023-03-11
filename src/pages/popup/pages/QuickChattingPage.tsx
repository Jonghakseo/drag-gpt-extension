import { HStack, Textarea, VStack } from "@chakra-ui/react";
import StyledButton from "@pages/popup/components/StyledButton";
import { useMachine } from "@xstate/react";
import chatStateMachine from "@src/shared/xState/chatStateMachine";
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

async function getGPTResponse(messages: ChatCompletionRequestMessage[]) {
  return await sendMessageToBackgroundAsync({
    type: "RequestQuickChatGPT",
    input: messages,
  });
}
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
  const [state, send] = useMachine(chatStateMachine, {
    services: {
      getChatHistoryFromBackground,
      getGPTResponse: (context) => {
        const chatsWithoutError = context.chats.filter(
          (chat) => chat.role !== "error"
        );
        return getGPTResponse(
          chatsWithoutError as ChatCompletionRequestMessage[]
        );
      },
    },
    actions: {
      onExitChatting: onClickBackButton,
      resetChatData: (context) => {
        context.chats = [];
        resetChatHistoriesFromBackground();
      },
    },
  });

  const { scrollDownRef } = useScrollDownEffect([state.context.chats.length]);

  const isLoading = state.matches("loading");

  const onChatSubmit: FormEventHandler = (event) => {
    event.preventDefault();
    send({ type: "QUERY" });
  };

  const onClickResetButton = () => {
    send("RESET");
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
    <VStack w="100%" minH={400} justifyContent="space-between">
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
        flexGrow={1}
        w="100%"
        overflowY="scroll"
        maxHeight={300}
        fontSize={13}
      >
        {state.context.chats.map((chat, index) => {
          switch (chat.role) {
            case "user":
              return (
                <UserChat key={index}>
                  <ChatText>{chat.content}</ChatText>
                </UserChat>
              );
            case "assistant":
              return (
                <AssistantChat key={index}>
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
      <HStack as="form" onSubmit={onChatSubmit} mt="auto">
        <Textarea
          resize="none"
          width={226}
          height={50}
          value={state.context.chatText}
          placeholder={t("quickChattingPage_chattingPlaceholder")}
          onChange={(e) => send({ type: "CHANGE_TEXT", data: e.target.value })}
          onKeyDown={onChatInputKeyDown}
        />
        <StyledButton type="submit" isLoading={isLoading}>
          {t("quickChattingPage_sendButtonText")}
        </StyledButton>
      </HStack>
    </VStack>
  );
}
