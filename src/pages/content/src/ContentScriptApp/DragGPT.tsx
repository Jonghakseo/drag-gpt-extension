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

export default function DragGPT() {
  const [state, send] = useMachine(DragStateMachine.machine);

  useEffect(() => {
    const onMouseUp = async (event: MouseEvent) => {
      await delayPromise(1);
      send({
        type: "TEXT_SELECTED",
        value: {
          selectedText: getSelectionText(),
          selectedNodeRect: getSelectionNodeRect(),
          requestButtonPosition: {
            top: event.y + window.scrollY,
            left: event.x + window.scrollX,
          },
        },
      });
    };

    window.document.addEventListener("mouseup", onMouseUp);
    return () => {
      window.document.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  const sendSelectionText = async () => {
    send("REQUEST");
    try {
      const responseText = await ChromeMessenger.sendMessageAsync({
        type: "RequestSelectionMessage",
        data: state.context.selectedText,
      });
      send({ type: "RESOLVE", responseText });
    } catch (error) {
      if (error instanceof Error) {
        send({ type: "REJECT", error });
      }
    }
  };

  const handleCloseMessageBox = () => {
    send("CLOSE_MESSAGE_BOX");
  };

  return (
    <>
      {state.hasTag(DragStateMachine.StateTag.ShowRequestButton) && (
        <GPTRequestButton
          loading={state.value === DragStateMachine.StateKey.Loading}
          onMouseDown={sendSelectionText}
          top={state.context.requestButtonPosition.top}
          left={state.context.requestButtonPosition.left}
        />
      )}
      {state.value === DragStateMachine.StateKey.ResponseMessageBox && (
        <ResponseMessageBox
          onClose={handleCloseMessageBox}
          text={state.context.responseText}
          anchorTop={state.context.anchorNodePosition.top}
          anchorCenter={state.context.anchorNodePosition.center}
          anchorBottom={state.context.anchorNodePosition.bottom}
          positionOnScreen={state.context.positionOnScreen}
        />
      )}
      {state.value === DragStateMachine.StateKey.ErrorMessageBox && (
        <ErrorMessageBox
          onClose={handleCloseMessageBox}
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
