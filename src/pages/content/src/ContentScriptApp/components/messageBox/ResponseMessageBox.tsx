import MessageBox, {
  MessageBoxProps,
} from "@pages/content/src/ContentScriptApp/components/messageBox/MessageBox";
import StyledButton from "@pages/popup/components/StyledButton";
import { Fragment, KeyboardEventHandler, useEffect, useState } from "react";
import {
  Box,
  Collapse,
  Divider,
  HStack,
  Input,
  StatDownArrow,
  StatUpArrow,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Chat } from "@pages/content/src/ContentScriptApp/stateMachine/dragStateMachine";
import styled from "@emotion/styled";
import { COLORS } from "@src/constant/style";
import { css } from "@emotion/react";

type ResponseMessageBoxProps = Omit<
  MessageBoxProps,
  "header" | "width" | "footer" | "content"
> & {
  chats: Chat[];
  loading: boolean;
  onRequestMoreChat: (moreChatText: string) => void;
};

export default function ResponseMessageBox({
  chats,
  loading,
  onRequestMoreChat,
  ...restProps
}: ResponseMessageBoxProps) {
  const [moreChatText, setMoreChatText] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  const requestMoreChat = () => {
    setMoreChatText("");
    onRequestMoreChat(moreChatText);
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

  return (
    <MessageBox
      header="Response"
      width={480}
      isOutsideClickDisabled={chats.length > 1}
      content={
        <VStack maxHeight={400} width="100%" overflowY="scroll">
          {chats.map((chat, index) => {
            const isLast =
              index === chats.length - 1 || index === chats.length - 2;
            const isLastAndResponse = isLast && chat.role === "assistant";
            return (
              <Fragment key={index}>
                <ChatBox chat={chat} isLastAndResponse={isLastAndResponse} />
                <Divider height={1} />
              </Fragment>
            );
          })}
        </VStack>
      }
      footer={
        <HStack width="100%" pt={8} justifyContent="space-between">
          <StyledButton onClick={copyResponse}>
            {isCopied ? "COPIED!" : "COPY"}
          </StyledButton>
          <HStack>
            <Input
              width={250}
              value={moreChatText}
              placeholder="ex. Summarize!"
              onChange={(e) => setMoreChatText(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <StyledButton
              disabled={moreChatText.length === 0}
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

  const handleToggle = () => setShow(!show);

  const textNode = (
    <Text
      borderRadius={4}
      border="1px solid #f0ffff2e"
      padding="3px 8px"
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
      <Box>
        <CollapseBox isShow={show}>
          <Collapse startingHeight={24} in={show} animateOpacity>
            {textNode}
          </Collapse>
        </CollapseBox>
        <Box onClick={handleToggle}>
          {show ? (
            <StatUpArrow cursor="pointer" color="white" />
          ) : (
            <StatDownArrow cursor="pointer" color="white" />
          )}
        </Box>
      </Box>
    );
  }

  return <Box alignSelf="end">{textNode}</Box>;
};

const CollapseBox = styled(Box)<{ isShow: boolean }>`
  cursor: pointer;
  align-self: start;
  position: relative;
  ${(p) =>
    p.isShow ||
    css`
      &:before {
        content: "";
        position: absolute;
        top: 0;
        right: 0;
        left: 0;
        height: 100%;

        background-image: linear-gradient(
          0deg,
          ${COLORS.PRIMARY} 0%,
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
