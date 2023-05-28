import MessageBox, {
  MessageBoxProps,
} from "@pages/content/src/ContentScriptApp/components/messageBox/MessageBox";
import StyledButton from "@pages/popup/components/StyledButton";
import { FormEventHandler } from "react";
import { HStack, Input, Text, VStack } from "@chakra-ui/react";
import DraggableBox from "@pages/content/src/ContentScriptApp/components/DraggableBox";
import { useMachine } from "@xstate/react";
import { ChatCompletionRequestMessage } from "openai";
import ChatText from "@src/shared/component/ChatText";
import AssistantChat from "@src/shared/component/AssistantChat";
import UserChat from "@src/shared/component/UserChat";
import { useScrollDownEffect } from "@src/shared/hook/useScrollDownEffect";
import { useCopyClipboard } from "@src/shared/hook/useCopyClipboard";
import { t } from "@src/chrome/i18n";
import { DragHandleIcon } from "@chakra-ui/icons";
import streamChatStateMachine from "@src/shared/xState/streamChatStateMachine";
import { getDragGPTResponseAsStream } from "@src/shared/services/getGPTResponseAsStream";

type ResponseMessageBoxProps = Omit<
  MessageBoxProps,
  "header" | "width" | "footer" | "content"
> & {
  initialChats: Chat[];
};

export default function ResponseMessageBox({
  initialChats,
  onClose,
  ...restProps
}: ResponseMessageBoxProps) {
  const [state, send] = useMachine(streamChatStateMachine, {
    services: {
      getChatHistoryFromBackground: () => Promise.resolve(initialChats),
      getGPTResponse: (context) => {
        return getDragGPTResponseAsStream({
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
      exitChatting: onClose,
    },
  });

  /** 첫 번째 질문 숨김처리 (드래깅으로 질문) */
  const [, ...chats] = state.context.chats;
  const isLoading = state.matches("loading");
  const isReceiving = state.matches("receiving");

  const { scrollDownRef } = useScrollDownEffect([chats.at(-1)?.content]);
  const { isCopied, copy } = useCopyClipboard([
    chats.filter(({ role }) => role === "assistant").length,
  ]);

  const onClickStopButton = () => {
    send("RECEIVE_CANCEL");
  };

  const onClickCopy = async () => {
    const lastResponseText = findLastResponseChat(chats);
    if (lastResponseText) {
      await copy(lastResponseText.content);
    }
  };
  // TODO refactor
  const lastResponseIndex: number = (() => {
    if (isLoading) {
      return chats.length - 2;
    }
    return chats.length - 1;
  })();

  const onChatSubmit: FormEventHandler = (event) => {
    event.preventDefault();
    send({ type: "QUERY" });
  };

  return (
    <MessageBox
      header={
        <Text
          as="header"
          display="flex"
          alignItems="center"
          width="100%"
          height={24}
          color="white"
          fontWeight="bold"
          cursor="move"
          className={DraggableBox.handlerClassName}
        >
          <DragHandleIcon mr={4} boxSize={12} />
          {t("responseMessageBox_responseTitle")}
        </Text>
      }
      onClose={() => send("EXIT")}
      width={480}
      isOutsideClickDisabled={chats.length > 1}
      content={
        <VStack
          ref={scrollDownRef}
          maxHeight={400}
          width="100%"
          overflowY="scroll"
        >
          {chats.map((chat, index) => (
            <ChatBox
              key={index}
              chat={chat}
              isLastAndResponse={lastResponseIndex === index}
            />
          ))}
        </VStack>
      }
      footer={
        // TODO refactor
        <HStack width="100%" pt={8} justifyContent="space-between">
          <StyledButton onClick={onClickCopy}>
            {isCopied
              ? t("responseMessageBox_copyButtonText_copied")
              : t("responseMessageBox_copyButtonText_copy")}
          </StyledButton>
          {isReceiving && (
            <StyledButton colorScheme="orange" onClick={onClickStopButton}>
              {t("responseMessageBox_stopButtonText")}
            </StyledButton>
          )}
          <HStack as="form" onSubmit={onChatSubmit}>
            <Input
              width={230}
              value={state.context.inputText}
              placeholder={t("responseMessageBox_messageInputPlacepolder")}
              onChange={(e) =>
                send({ type: "CHANGE_TEXT", data: e.target.value })
              }
              onKeyDown={(e) => e.stopPropagation()}
            />

            <StyledButton type="submit" isLoading={isLoading || isReceiving}>
              {t("responseMessageBox_sendButtonText")}
            </StyledButton>
          </HStack>
        </HStack>
      }
      {...restProps}
    />
  );
}

// TODO refactor
const ChatBox = ({
  chat,
  isLastAndResponse,
}: {
  chat: Chat;
  isLastAndResponse: boolean;
}) => {
  if (isLastAndResponse) {
    return (
      <AssistantChat>
        <ChatText>{chat.content}</ChatText>
      </AssistantChat>
    );
  }
  if (chat.role === "error") {
    return (
      <AssistantChat>
        <ChatText isError>{chat.content}</ChatText>
      </AssistantChat>
    );
  }

  if (chat.role === "assistant") {
    return (
      // <ChatCollapse>
      <AssistantChat>
        <ChatText>{chat.content}</ChatText>
      </AssistantChat>
      // </ChatCollapse>
    );
  }

  return (
    <UserChat>
      <ChatText bold>{chat.content.trim()}</ChatText>
    </UserChat>
  );
};

function findLastResponseChat(chats: Chat[]) {
  return chats.filter((chat) => chat.role === "assistant").at(-1);
}
