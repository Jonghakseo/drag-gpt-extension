import MessageBox, {
  MessageBoxProps,
} from "@pages/content/src/ContentScriptApp/components/messageBox/MessageBox";
import StyledButton from "@pages/popup/components/StyledButton";
import {
  DependencyList,
  FormEventHandler,
  useEffect,
  useRef,
  useState,
} from "react";
import { HStack, Input, Text, VStack } from "@chakra-ui/react";
import DraggableBox from "@pages/content/src/ContentScriptApp/components/DraggableBox";
import { useMachine } from "@xstate/react";
import chatStateMachine, { Chat } from "@src/shared/xState/chatStateMachine";
import { ChatCompletionRequestMessage } from "openai";
import { sendMessageToBackgroundAsync } from "@src/chrome/message";
import ChatText from "@src/shared/component/ChatText";
import AssistantChat from "@src/shared/component/AssistantChat";
import UserChat from "@src/shared/component/UserChat";
import ChatCollapse from "@src/shared/component/ChatCollapse";

async function getGPTResponse(messages: ChatCompletionRequestMessage[]) {
  return await sendMessageToBackgroundAsync({
    type: "RequestOngoingChatGPTResponse",
    data: messages,
  });
}

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
  const [state, send] = useMachine(chatStateMachine, {
    context: {
      chats: initialChats,
    },
    services: {
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
      onExitChatting: onClose,
    },
  });

  /** 첫 번째 질문 숨김처리 (드래깅으로 질문) */
  const [, ...chats] = state.context.chats;
  const isLoading = state.matches("loading");

  const { scrollDownRef } = useScrollDownEffect([chats.length]);
  const { isCopied, copyLastResponse } = useCopyLastResponse(
    chats.filter(({ role }) => role === "assistant").length
  );

  const onClickCopy = async () => {
    const lastResponseText = findLastResponseChat(chats);
    if (lastResponseText) {
      await copyLastResponse(lastResponseText.content);
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
          color="white"
          fontWeight="bold"
          cursor="move"
          className={DraggableBox.handlerClassName}
        >
          ✣ Response
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
            {isCopied ? "COPIED!" : "COPY LAST RESPONSE"}
          </StyledButton>
          <HStack as="form" onSubmit={onChatSubmit}>
            <Input
              width={230}
              value={state.context.chatText}
              placeholder="ex. Summarize!"
              onChange={(e) =>
                send({ type: "CHANGE_TEXT", data: e.target.value })
              }
              onKeyDown={(e) => e.stopPropagation()}
            />
            <StyledButton type="submit" isLoading={isLoading}>
              SEND
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
        <ChatText>{chat.content.trim()}</ChatText>
      </AssistantChat>
    );
  }
  if (chat.role === "error") {
    return (
      <AssistantChat>
        <ChatText isError>{chat.content.trim()}</ChatText>
      </AssistantChat>
    );
  }

  if (chat.role === "assistant") {
    return (
      <ChatCollapse>
        <AssistantChat>
          <ChatText>{chat.content.trim()}</ChatText>
        </AssistantChat>
      </ChatCollapse>
    );
  }

  return (
    <UserChat>
      <ChatText bold>{chat.content.trim()}</ChatText>
    </UserChat>
  );
};

function useCopyLastResponse(assistantMessageLength: number) {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    setIsCopied(false);
  }, [assistantMessageLength]);

  const copyLastResponse = async (lastResponseText: string) => {
    await copyToClipboard(lastResponseText);
    setIsCopied(true);
  };

  return {
    isCopied,
    copyLastResponse,
  };
}

function useScrollDownEffect(deps?: DependencyList) {
  const scrollDownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scrollDownRef.current) {
      return;
    }
    scrollDownRef.current.scrollTo({
      top: scrollDownRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, deps);

  return { scrollDownRef };
}

async function copyToClipboard(text: string) {
  await navigator.clipboard.writeText(text);
}

function findLastResponseChat(chats: Chat[]) {
  return chats.filter((chat) => chat.role === "assistant").at(-1);
}
