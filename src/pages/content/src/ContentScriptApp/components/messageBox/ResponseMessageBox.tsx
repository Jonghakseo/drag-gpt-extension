import MessageBox, {
  MessageBoxProps,
} from "@pages/content/src/ContentScriptApp/components/messageBox/MessageBox";
import StyledButton from "@pages/popup/components/StyledButton";
import {
  DependencyList,
  KeyboardEventHandler,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Box,
  Collapse,
  HStack,
  Input,
  StatUpArrow,
  Text,
  VStack,
} from "@chakra-ui/react";
import styled from "@emotion/styled";
import { COLORS } from "@src/constant/style";
import { css } from "@emotion/react";
import DraggableBox from "@pages/content/src/ContentScriptApp/components/DraggableBox";
import { useMachine } from "@xstate/react";
import chatStateMachine, {
  Chat,
} from "@pages/content/src/ContentScriptApp/stateMachine/chatStateMachine";
import { ChatCompletionRequestMessage } from "openai";
import { sendMessageToBackgroundAsync } from "@src/chrome/message";

async function getAdditionalGPTResponse(
  messages: ChatCompletionRequestMessage[]
) {
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
        return getAdditionalGPTResponse(
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

  const sendChatQuery = () => {
    send({ type: "QUERY" });
  };

  const onClickCopy = async () => {
    const lastResponseText = findLastResponseChat(chats);
    if (lastResponseText) {
      await copyLastResponse(lastResponseText.content);
    }
  };

  const handleKeyPress: KeyboardEventHandler<HTMLInputElement> = (event) => {
    event.stopPropagation();
    if (event.key === "Enter") {
      sendChatQuery();
    }
  };

  // TODO refactor
  const lastResponseIndex: number = (() => {
    if (isLoading) {
      return chats.length - 2;
    }
    return chats.length - 1;
  })();

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
          <HStack>
            <Input
              width={230}
              value={state.context.chatText}
              placeholder="ex. Summarize!"
              onChange={(e) =>
                send({ type: "CHANGE_TEXT", data: e.target.value })
              }
              onKeyDown={handleKeyPress}
            />
            <StyledButton isLoading={isLoading} onClick={sendChatQuery}>
              CONTINUE
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
  const [show, setShow] = useState(false);

  const openCollapse = () => setShow(true);
  const closeCollapse = () => setShow(false);

  const textNode = (
    <Text
      borderRadius={4}
      border="1px solid #f0ffff2e"
      padding={6}
      color={chat.role === "error" ? "red" : "white"}
      fontWeight={chat.role === "user" ? "bold" : "normal"}
    >
      {chat.content.trim()}
    </Text>
  );

  if (isLastAndResponse) {
    return (
      <Box alignSelf={chat.role === "user" ? "end" : "start"}>{textNode}</Box>
    );
  }

  if (chat.role === "assistant") {
    return (
      <CollapseBox isShow={show} onClick={openCollapse}>
        <Collapse startingHeight={24} in={show} animateOpacity>
          <Text
            borderRadius={4}
            border="1px solid #f0ffff2e"
            padding={6}
            color="white"
            fontWeight="normal"
          >
            {chat.content.trim()}
            <VStack
              margin="4px auto 0"
              cursor="pointer"
              width="100%"
              onClick={(e) => {
                closeCollapse();
                e.stopPropagation();
              }}
            >
              <StatUpArrow color="white" />
            </VStack>
          </Text>
        </Collapse>
      </CollapseBox>
    );
  }

  return <Box alignSelf="end">{textNode}</Box>;
};

const CollapseBox = styled(Box)<{ isShow: boolean }>`
  align-self: start;
  position: relative;
  ${(p) =>
    p.isShow ||
    css`
      cursor: pointer;
      &:before {
        content: "";
        position: absolute;
        top: 0;
        right: 0;
        left: 0;
        height: 100%;

        background-image: linear-gradient(
          0deg,
          ${COLORS.CONTENT_BACKGROUND} 0%,
          rgba(0, 0, 0, 0) 100%
        );
      }
    `}
`;

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
