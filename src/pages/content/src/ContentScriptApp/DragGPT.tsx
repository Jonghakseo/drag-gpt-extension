import { useEffect } from "react";
import {
  getSelectionNodeRect,
  getSelectionText,
} from "@pages/content/src/ContentScriptApp/utils/selection";
import GPTRequestButton from "@pages/content/src/ContentScriptApp/components/GPTRequestButton";
import ResponseMessageBox from "@pages/content/src/ContentScriptApp/components/messageBox/ResponseMessageBox";
import ErrorMessageBox from "@pages/content/src/ContentScriptApp/components/messageBox/ErrorMessageBox";
import { useMachine } from "@xstate/react";
import delayPromise from "@pages/content/src/ContentScriptApp/utils/delayPromise";
import dragStateMachine from "@pages/content/src/ContentScriptApp/stateMachine/dragStateMachine";
import { sendMessageToBackgroundAsync } from "@src/chrome/message";
import { ChatCompletionRequestMessage } from "openai";
import styled from "@emotion/styled";

const Container = styled.div`
  * {
    font-family: "Noto Sans KR", sans-serif;
  }
`;

const skipLoopCycleOnce = async () => await delayPromise(1);

async function getGPTResponse(userInput: string) {
  console.log("RequestSelectionMessage");
  return await sendMessageToBackgroundAsync({
    type: "RequestSelectionMessage",
    data: userInput,
  });
}

async function getAdditionalGPTResponse(
  input: string,
  histories: ChatCompletionRequestMessage[]
) {
  return await sendMessageToBackgroundAsync({
    type: "RequestAdditionalChat",
    data: { input, histories },
  });
}

export default function DragGPT() {
  const [state, send] = useMachine(dragStateMachine, {
    services: {
      getGPTResponse: (context) => getGPTResponse(context.selectedText),
      getAdditionalGPTResponse: (context) => {
        const requestChat = context.chats.at(-1)?.content ?? "";
        const chatsWithoutError = context.chats.filter(
          (chat) => chat.role !== "error"
        );
        return getAdditionalGPTResponse(
          requestChat,
          chatsWithoutError as ChatCompletionRequestMessage[]
        );
      },
    },
  });

  useEffect(() => {
    const onMouseUp = async (event: MouseEvent) => {
      /** Selection 이벤트 호출을 기다리는 해키한 코드 */
      await skipLoopCycleOnce();
      send({
        type: "TEXT_SELECTED",
        value: {
          selectedText: getSelectionText(),
          selectedNodeRect: getSelectionNodeRect(),
          requestButtonPosition: {
            top: event.clientY + window.scrollY,
            left: event.clientX + window.scrollX,
          },
        },
      });
    };

    window.document.addEventListener("mouseup", onMouseUp);
    return () => {
      window.document.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  const requestGPT = () => {
    send("REQUEST");
  };

  const closeMessageBox = () => {
    send("CLOSE_MESSAGE_BOX");
  };

  const onRequestAdditionalChat = (additionalChatText: string) => {
    send({ type: "REQUEST_ADDITIONAL_CHAT", chatText: additionalChatText });
  };

  return (
    <Container>
      {state.hasTag("showRequestButton") && (
        <GPTRequestButton
          onClick={requestGPT}
          loading={state.matches("loading")}
          top={state.context.requestButtonPosition.top}
          left={state.context.requestButtonPosition.left}
        />
      )}
      {state.hasTag("showResponseMessages") && (
        <ResponseMessageBox
          onClose={closeMessageBox}
          loading={state.matches("chat_loading_message_box")}
          onRequestAdditionalChat={onRequestAdditionalChat}
          chats={state.context.chats}
          anchorTop={state.context.anchorNodePosition.top}
          anchorCenter={state.context.anchorNodePosition.center}
          anchorBottom={state.context.anchorNodePosition.bottom}
          positionOnScreen={state.context.positionOnScreen}
        />
      )}
      {state.matches("error_message_box") && (
        <ErrorMessageBox
          onClose={closeMessageBox}
          error={state.context.error}
          anchorTop={state.context.anchorNodePosition.top}
          anchorCenter={state.context.anchorNodePosition.center}
          anchorBottom={state.context.anchorNodePosition.bottom}
          positionOnScreen={state.context.positionOnScreen}
        />
      )}
    </Container>
  );
}
