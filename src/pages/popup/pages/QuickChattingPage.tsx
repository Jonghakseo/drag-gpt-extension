import {
  Button,
  ButtonProps,
  HStack,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import StyledButton from "@pages/popup/components/StyledButton";
import { useMachine } from "@xstate/react";
import {
  sendMessageToBackground,
  sendMessageToBackgroundAsync,
} from "@src/chrome/message";
import {
  FormEventHandler,
  forwardRef,
  ForwardRefRenderFunction,
  KeyboardEventHandler,
} from "react";
import { useScrollDownEffect } from "@src/shared/hook/useScrollDownEffect";
import { t } from "@src/chrome/i18n";
import { useCopyClipboard } from "@src/shared/hook/useCopyClipboard";
import streamChatStateMachine from "@src/shared/xState/streamChatStateMachine";
import { getQuickGPTResponseAsStream } from "@src/shared/services/getGPTResponseAsStream";
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
    context: {
      inputText: "",
      chats: [],
      tempResponse: "",
      model: (localStorage.getItem("model") as any) ?? "gpt-3.5-turbo",
    },
    services: {
      getChatHistoryFromBackground: () => {
        return sendMessageToBackgroundAsync({
          type: "GetQuickChatHistory",
        });
      },
      getGPTResponse: (context) => {
        return getQuickGPTResponseAsStream({
          model: context.model,
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

  const onSelectModel = (model: "gpt-4-turbo" | "gpt-4o" | "gpt-3.5-turbo") => {
    send("SELECT_GPT_MODEL", { data: model });
    localStorage.setItem("model", model);
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
            <Menu>
              <MenuButton as={forwardRef(ModelSelectButton)}>
                {state.context.model}
              </MenuButton>
              <MenuList>
                <MenuItem onClick={() => onSelectModel("gpt-3.5-turbo")}>
                  gpt-3.5-turbo
                </MenuItem>
                <MenuItem onClick={() => onSelectModel("gpt-4o")}>
                  gpt-4o
                </MenuItem>
                <MenuItem onClick={() => onSelectModel("gpt-4-turbo")}>
                  gpt-4-turbo
                </MenuItem>
              </MenuList>
            </Menu>
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

const ModelSelectButton: ForwardRefRenderFunction<
  HTMLButtonElement,
  ButtonProps
> = (props, ref) => {
  return <Button ref={ref} {...props} size="xs" />;
};

function findLastResponseChat(chats: Chat[]) {
  return chats.filter((chat) => chat.role === "assistant").at(-1);
}
