import { Button, HStack, Input, StackProps, VStack } from "@chakra-ui/react";
import { ChatBox } from "@pages/content/src/ContentScriptApp/components/messageBox/ResponseMessageBox";
import { useMachine } from "@xstate/react";
import streamChatStateMachine from "@src/shared/xState/streamChatStateMachine";
import { sendMessageToBackgroundAsync } from "@src/chrome/message";
import { getDragGPTResponseAsStream } from "@src/shared/services/getGPTResponseAsStream";
import { t } from "@src/chrome/i18n";
import { useCopyClipboard } from "@src/shared/hook/useCopyClipboard";
import useBackgroundMessage from "@src/shared/hook/useBackgroundMessage";
import { useEffect } from "react";
import { useScrollDownEffect } from "@src/shared/hook/useScrollDownEffect";

type ChatHistoryProps = {
  sessionId: string;
} & StackProps;

export default function ChatHistory({
  sessionId,
  ...restProps
}: ChatHistoryProps) {
  const { data, refetch } = useBackgroundMessage({
    type: "GetChatSessionHistory",
    input: sessionId,
  });
  const chats = data.history;

  useEffect(() => {
    refetch();
  }, [sessionId]);

  return (
    <ChatHistoryWithInitialChatData
      key={sessionId}
      chats={chats}
      sessionId={sessionId}
      {...restProps}
    />
  );
}

function findLastResponseChat(chats: Chat[]) {
  return chats.filter((chat) => chat.role === "assistant").at(-1);
}

type ChatHistoryWithInitialChatDataProps = {
  chats: Chat[];
} & ChatHistoryProps;

function ChatHistoryWithInitialChatData({
  sessionId,
  chats,
  ...restProps
}: ChatHistoryWithInitialChatDataProps) {
  const [state, send] = useMachine(streamChatStateMachine, {
    services: {
      getChatHistoryFromBackground: () => Promise.resolve(chats),
      getGPTResponse: (context) => {
        void sendMessageToBackgroundAsync({
          type: "PushChatHistory",
          input: { sessionId, chats: context.chats.at(-1) as Chat },
        });
        return getDragGPTResponseAsStream({
          input: { chats: context.chats, sessionId },
          onDelta: (chunk) => send("RECEIVE_ING", { data: chunk }),
          onFinish: (result) => {
            send("RECEIVE_DONE", { data: result });
            void sendMessageToBackgroundAsync({
              type: "PushChatHistory",
              input: {
                sessionId,
                chats: { role: "assistant", content: result },
              },
            });
          },
        });
      },
    },
    actions: {
      exitChatting: () => undefined,
    },
  });
  const isLoading = state.matches("loading");
  const isReceiving = state.matches("receiving");

  const { isCopied, copy } = useCopyClipboard([
    chats.filter(({ role }) => role === "assistant").length,
  ]);

  const onClickCopy = async () => {
    const lastResponseText = findLastResponseChat(chats);
    if (lastResponseText) {
      await copy(lastResponseText.content);
    }
  };

  const { scrollDownRef } = useScrollDownEffect([
    state.context.chats.at(-1)?.content,
  ]);

  return (
    <>
      <VStack ref={scrollDownRef} {...restProps}>
        {state.context.chats.map((chat, index) => (
          <ChatBox chat={chat} key={index} />
        ))}
      </VStack>
      <VStack alignItems="start" pt={2}>
        <HStack
          width="100%"
          as="form"
          onSubmit={(event) => {
            event.preventDefault();
            send({ type: "QUERY" });
          }}
        >
          <Input
            size="sm"
            width="100%"
            color="white"
            value={state.context.inputText}
            placeholder={t("responseMessageBox_messageInputPlacepolder")}
            onChange={(e) =>
              send({ type: "CHANGE_TEXT", data: e.target.value })
            }
            onKeyDown={(e) => e.stopPropagation()}
          />

          <Button size="sm" type="submit" isLoading={isLoading || isReceiving}>
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
              onClick={() => send("RECEIVE_CANCEL")}
            >
              {t("responseMessageBox_stopButtonText")}
            </Button>
          )}
        </HStack>
      </VStack>
    </>
  );
}
