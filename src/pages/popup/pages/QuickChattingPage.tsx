import { HStack, Input, VStack } from "@chakra-ui/react";
import StyledButton from "@pages/popup/components/StyledButton";
import { useMachine } from "@xstate/react";
import chatStateMachine from "@src/shared/xState/chatStateMachine";
import { ChatCompletionRequestMessage } from "openai";
import { sendMessageToBackgroundAsync } from "@src/chrome/message";
import { FormEventHandler } from "react";
import UserChat from "@src/shared/component/UserChat";
import ChatText from "@src/shared/component/ChatText";
import AssistantChat from "@src/shared/component/AssistantChat";

async function getGPTResponse(messages: ChatCompletionRequestMessage[]) {
  return await sendMessageToBackgroundAsync({
    type: "RequestQuickChatGPTResponse",
    data: messages,
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
    },
  });

  const isLoading = state.matches("loading");

  const onChatSubmit: FormEventHandler = (event) => {
    event.preventDefault();
    send({ type: "QUERY" });
  };
  return (
    <VStack w="100%" minH={400} justifyContent="space-between">
      <VStack w="100%" overflowY="scroll" maxHeight={300} fontSize={13}>
        <HStack w="100%" justifyContent="space-between">
          <StyledButton onClick={onClickBackButton}>BACK</StyledButton>
          {/* TODO */}
          <StyledButton>RESET</StyledButton>
        </HStack>
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
        <Input
          width={226}
          value={state.context.chatText}
          placeholder="ex. Hello!"
          onChange={(e) => send({ type: "CHANGE_TEXT", data: e.target.value })}
        />
        <StyledButton type="submit" isLoading={isLoading}>
          SEND
        </StyledButton>
      </HStack>
    </VStack>
  );
}
