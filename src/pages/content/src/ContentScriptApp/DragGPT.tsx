import { useEffect } from "react";
import {
  getSelectionNodeRect,
  getSelectionText,
} from "@pages/content/src/ContentScriptApp/utils/selection";
import GPTRequestButton from "@pages/content/src/ContentScriptApp/components/GPTRequestButton";
import { ChromeMessenger } from "@pages/chrome/ChromeMessenger";
import ResponseMessageBox from "@pages/content/src/ContentScriptApp/components/messageBox/ResponseMessageBox";
import ErrorMessageBox from "@pages/content/src/ContentScriptApp/components/messageBox/ErrorMessageBox";
import { useMachine } from "@xstate/react";
import delayPromise from "@pages/content/src/ContentScriptApp/utils/delayPromise";
import dragStateMachine from "@pages/content/src/ContentScriptApp/stateMachine/dragStateMachine";

async function getGPTResponse(userInput: string) {
  return await ChromeMessenger.sendMessageAsync({
    type: "RequestSelectionMessage",
    data: userInput,
  });
}

export default function DragGPT() {
  const [state, send] = useMachine(dragStateMachine, {
    services: {
      getGPTResponse: (context) => getGPTResponse(context.selectedText),
    },
  });

  useEffect(() => {
    const onMouseUp = async (event: MouseEvent) => {
      await delayPromise(1);
      const selectionNodeRect = getSelectionNodeRect();
      send({
        type: "TEXT_SELECTED",
        value: {
          selectedText: getSelectionText(),
          selectedNodeRect: selectionNodeRect,
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

  return (
    <>
      {state.hasTag("showRequestButton") && (
        <GPTRequestButton
          onClick={requestGPT}
          loading={state.matches("loading")}
          top={state.context.requestButtonPosition.top}
          left={state.context.requestButtonPosition.left}
        />
      )}
      {state.matches("response_message_box") && (
        <ResponseMessageBox
          onClose={closeMessageBox}
          text={state.context.responseText}
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
    </>
  );
}
