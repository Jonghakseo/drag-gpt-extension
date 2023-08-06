import MessageBox, {
  MessageBoxProps,
} from "@pages/content/src/ContentScriptApp/components/messageBox/MessageBox";
import StyledButton from "@pages/popup/components/StyledButton";
import { FormEventHandler } from "react";
import { Button, HStack, Input, Text, VStack } from "@chakra-ui/react";
import DraggableBox from "@pages/content/src/ContentScriptApp/components/DraggableBox";
import { useMachine } from "@xstate/react";
import ChatText from "@src/shared/component/ChatText";
import AssistantChat from "@src/shared/component/AssistantChat";
import UserChat from "@src/shared/component/UserChat";
import { useScrollDownEffect } from "@src/shared/hook/useScrollDownEffect";
import { useCopyClipboard } from "@src/shared/hook/useCopyClipboard";
import { t } from "@src/chrome/i18n";
import { DragHandleIcon } from "@chakra-ui/icons";
import streamChatStateMachine from "@src/shared/xState/streamChatStateMachine";
import { getDragGPTResponseAsStream } from "@src/shared/services/getGPTResponseAsStream";
import { sendMessageToBackgroundAsync } from "@src/chrome/message";
import useGeneratedId from "@src/shared/hook/useGeneratedId";

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
  const { id: sessionId } = useGeneratedId("drag_");
  const [state, send] = useMachine(streamChatStateMachine, {
    services: {
      getChatHistoryFromBackground: async () => {
        void sendMessageToBackgroundAsync({
          type: "SaveChatHistory",
          input: { sessionId, chats: initialChats, type: "Drag" },
        });
        return initialChats;
      },
      getGPTResponse: (context) => {
        return getDragGPTResponseAsStream({
          input: { chats: context.chats, sessionId },
          onDelta: (chunk) => send("RECEIVE_ING", { data: chunk }),
          onFinish: (result) => {
            void sendMessageToBackgroundAsync({
              type: "SaveChatHistory",
              input: { sessionId, chats: context.chats, type: "Drag" },
            });
            send("RECEIVE_DONE", { data: result });
          },
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
          height="24px"
          color="white"
          fontWeight="bold"
          cursor="move"
          className={DraggableBox.handlerClassName}
        >
          <DragHandleIcon mr="4px" boxSize="12px" />
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
            <ChatBox key={index} chat={chat} />
          ))}
        </VStack>
      }
      footer={
        <VStack alignItems="start" pt={2}>
          <HStack width="100%" as="form" onSubmit={onChatSubmit}>
            <Input
              width="100%"
              color="white"
              value={state.context.inputText}
              placeholder={t("responseMessageBox_messageInputPlacepolder")}
              onChange={(e) =>
                send({ type: "CHANGE_TEXT", data: e.target.value })
              }
              onKeyDown={(e) => e.stopPropagation()}
            />

            <Button
              size="sm"
              type="submit"
              isLoading={isLoading || isReceiving}
            >
              {t("responseMessageBox_sendButtonText")}
            </Button>
          </HStack>
          <HStack width="100%" justifyContent="flex-start" gap="4px">
            <Button size="xs" onClick={onClickCopy}>
              {isCopied
                ? t("responseMessageBox_copyButtonText_copied")
                : t("responseMessageBox_copyButtonText_copy")}
            </Button>
            {isReceiving && (
              <Button
                size="xs"
                colorScheme="orange"
                onClick={onClickStopButton}
              >
                {t("responseMessageBox_stopButtonText")}
              </Button>
            )}
          </HStack>
        </VStack>
      }
      {...restProps}
    />
  );
}

// TODO refactor
export const ChatBox = ({ chat }: { chat: Chat }) => {
  if (chat.role === "error") {
    return (
      <AssistantChat>
        <ChatText isError>{chat.content}</ChatText>
      </AssistantChat>
    );
  }

  if (chat.role === "assistant") {
    return (
      <AssistantChat>
        <ChatText>{chat.content}</ChatText>
      </AssistantChat>
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
