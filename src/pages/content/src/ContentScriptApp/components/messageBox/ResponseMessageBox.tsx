import MessageBox, {
  MessageBoxProps,
} from "@pages/content/src/ContentScriptApp/components/messageBox/MessageBox";
import StyledButton from "@pages/popup/components/StyledButton";
import {
  KeyboardEventHandler,
  useEffect,
  useMemo,
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
import { Chat } from "@pages/content/src/ContentScriptApp/stateMachine/dragStateMachine";
import styled from "@emotion/styled";
import { COLORS } from "@src/constant/style";
import { css } from "@emotion/react";
import DraggableBox from "@pages/content/src/ContentScriptApp/components/DraggableBox";

type ResponseMessageBoxProps = Omit<
  MessageBoxProps,
  "header" | "width" | "footer" | "content"
> & {
  chats: Chat[];
  loading: boolean;
  onRequestAdditionalChat: (text: string) => void;
};

export default function ResponseMessageBox({
  chats,
  loading,
  onRequestAdditionalChat,
  ...restProps
}: ResponseMessageBoxProps) {
  const chatListRef = useRef<HTMLDivElement>(null);
  const [additionalChatText, setAdditionalChatText] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  const requestMoreChat = () => {
    setAdditionalChatText("");
    onRequestAdditionalChat(additionalChatText);
  };

  useEffect(() => {
    setIsCopied(false);
  }, [chats.length]);

  const copyResponse = async () => {
    const lastResponseText = findLastResponseChat(chats);
    if (!lastResponseText) {
      return;
    }
    await copyToClipboard(lastResponseText.content);
    setIsCopied(true);
  };

  const handleKeyPress: KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.key === "Enter") {
      requestMoreChat();
    }
    event.stopPropagation();
  };

  useEffect(() => {
    if (!chatListRef.current) {
      return;
    }
    chatListRef.current.scrollTo({
      top: chatListRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [chats.length]);

  const lastResponseIndex: number = (() => {
    if (loading) {
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
      width={480}
      isOutsideClickDisabled={chats.length > 1}
      content={
        <VStack
          ref={chatListRef}
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
        <HStack width="100%" pt={8} justifyContent="space-between">
          <StyledButton onClick={copyResponse}>
            {isCopied ? "COPIED!" : "COPY LAST RESPONSE"}
          </StyledButton>
          <HStack>
            <Input
              width={230}
              value={additionalChatText}
              placeholder="ex. Summarize!"
              onChange={(e) => setAdditionalChatText(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <StyledButton
              disabled={additionalChatText.length === 0}
              isLoading={loading}
              onClick={requestMoreChat}
            >
              CONTINUE
            </StyledButton>
          </HStack>
        </HStack>
      }
      {...restProps}
    />
  );
}

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

async function copyToClipboard(text: string) {
  await navigator.clipboard.writeText(text);
}

function findLastResponseChat(chats: Chat[]) {
  return chats.filter((chat) => chat.role === "assistant").at(-1);
}
