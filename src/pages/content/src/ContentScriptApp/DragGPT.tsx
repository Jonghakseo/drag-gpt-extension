import { useEffect, useState } from "react";
import {
  getPositionOnScreen,
  PositionOnScreen,
} from "@pages/content/src/ContentScriptApp/utils/getPositionOnScreen";
import {
  getSelectionNodeRect,
  getSelectionText,
} from "@pages/content/src/ContentScriptApp/utils/selection";
import GPTRequestButton from "@pages/content/src/ContentScriptApp/components/GPTRequestButton";
import { ChromeMessenger } from "@pages/chrome/ChromeMessenger";
import ResponseMessageBox from "@pages/content/src/ContentScriptApp/components/messageBox/ResponseMessageBox";
import ErrorMessageBox from "@pages/content/src/ContentScriptApp/components/messageBox/ErrorMessageBox";

type Position = { top: number; left: number };
const INITIAL_POSITION: Position = { top: 0, left: 0 };

const MINIMUM_SELECTION_TEXT = 5;

export default function DragGPT() {
  const [selectedText, setSelectedText] = useState<string>("");
  const [gptResponseText, setGptResponseText] = useState<string>("");
  const [gptResponseError, setGptResponseError] = useState<Error | null>(null);
  const [requestLoading, setRequestLoading] = useState<boolean>(false);
  const [requestButtonPosition, setRequestButtonPosition] =
    useState<Position>(INITIAL_POSITION);
  const [anchorNodeRect, setAnchorNodeRect] = useState<{
    top: number;
    bottom: number;
    center: number;
  }>({ top: 0, center: 0, bottom: 0 });
  const [positionOnScreen, setPositionOnScreen] = useState<PositionOnScreen>(
    PositionOnScreen.topLeft
  );

  useEffect(() => {
    const onMouseUp = async (event: MouseEvent) => {
      if (requestLoading || !!gptResponseText) {
        return;
      }
      const selectionText = getSelectionText();
      if (selectionText === selectedText) {
        return;
      }

      setSelectedText(selectionText);
      if (selectionText.length < MINIMUM_SELECTION_TEXT) {
        return;
      }

      setRequestButtonPosition({
        top: event.y + window.scrollY,
        left: event.x + window.scrollX,
      });

      const { left, width, height, top } = getSelectionNodeRect();
      const verticalCenter = left + width / 2;
      const horizontalCenter = top + height / 2;
      const position = getPositionOnScreen({
        verticalCenter,
        horizontalCenter,
      });
      setPositionOnScreen(position);
      setAnchorNodeRect({
        top: top + window.scrollY,
        bottom: top + height + window.scrollY,
        center: verticalCenter + window.scrollX,
      });
    };

    window.document.addEventListener("mouseup", onMouseUp);
    return () => {
      window.document.removeEventListener("mouseup", onMouseUp);
    };
  }, [requestLoading, gptResponseText, selectedText]);

  const sendSelectionText = async () => {
    setRequestLoading(true);
    try {
      const responseMessage = await ChromeMessenger.sendMessageAsync({
        type: "RequestSelectionMessage",
        data: selectedText,
      });
      switch (responseMessage.type) {
        case "GPTResponse":
          setGptResponseText(responseMessage.data);
          break;
        case "Error":
          setGptResponseError(responseMessage.data);
          break;
        default:
          console.error("unknown message", { message: responseMessage });
      }
    } finally {
      setRequestLoading(false);
    }
  };

  const handleCloseMessageBox = () => {
    setGptResponseText("");
    setSelectedText("");
    setGptResponseError(null);
  };

  const showRequestButton =
    !!selectedText && !gptResponseText && !gptResponseError;

  return (
    <>
      {showRequestButton && (
        <GPTRequestButton
          loading={requestLoading}
          onMouseDown={sendSelectionText}
          top={requestButtonPosition.top}
          left={requestButtonPosition.left}
        />
      )}
      {gptResponseText && (
        <ResponseMessageBox
          onClose={handleCloseMessageBox}
          text={gptResponseText}
          anchorTop={anchorNodeRect.top}
          anchorCenter={anchorNodeRect.center}
          anchorBottom={anchorNodeRect.bottom}
          positionOnScreen={positionOnScreen}
        />
      )}
      {gptResponseError && (
        <ErrorMessageBox
          onClose={handleCloseMessageBox}
          error={gptResponseError}
          anchorTop={anchorNodeRect.top}
          anchorCenter={anchorNodeRect.center}
          anchorBottom={anchorNodeRect.bottom}
          positionOnScreen={positionOnScreen}
        />
      )}
    </>
  );
}
