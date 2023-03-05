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
import DragStateMachine from "@pages/content/src/ContentScriptApp/stateMachine/dragStateMachine";
import delayPromise from "@pages/content/src/ContentScriptApp/utils/delayPromise";

async function getGPTResponse(userInput: string) {
  return await ChromeMessenger.sendMessageAsync({
    type: "RequestSelectionMessage",
    data: userInput,
  });
}

export default function DragGPT() {
  const [state, send] = useMachine(DragStateMachine.machine);

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

  const requestGPT = async () => {
    send("REQUEST");
    try {
      const responseText = await getGPTResponse(state.context.selectedText);
      send({ type: "RESOLVE", responseText });
    } catch (error) {
      if (error instanceof Error) {
        send({ type: "REJECT", error });
      }
    }
  };

  const closeMessageBox = () => {
    send("CLOSE_MESSAGE_BOX");
  };

  return (
    <>
      {state.hasTag(DragStateMachine.StateTag.ShowRequestButton) && (
        <GPTRequestButton
          onClick={requestGPT}
          loading={state.value === DragStateMachine.StateKey.Loading}
          top={state.context.requestButtonPosition.top}
          left={state.context.requestButtonPosition.left}
        />
      )}
      {state.value === DragStateMachine.StateKey.ResponseMessageBox && (
        <ResponseMessageBox
          onClose={closeMessageBox}
          text={state.context.responseText}
          anchorTop={state.context.anchorNodePosition.top}
          anchorCenter={state.context.anchorNodePosition.center}
          anchorBottom={state.context.anchorNodePosition.bottom}
          positionOnScreen={state.context.positionOnScreen}
        />
      )}
      {state.value === DragStateMachine.StateKey.ErrorMessageBox && (
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
