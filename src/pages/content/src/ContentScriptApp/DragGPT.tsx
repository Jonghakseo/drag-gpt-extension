/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useEffect, useState } from "react";
import CommandPalette, { Command } from "react-command-palette";
import { useToast } from "@chakra-ui/react";
import copy from "copy-to-clipboard";
import {
  getSelectionNodeRect,
  getSelectionText,
} from "@pages/content/src/ContentScriptApp/utils/selection";
import GPTRequestButton from "@pages/content/src/ContentScriptApp/components/GPTRequestButton";
import ResponseMessageBox from "@pages/content/src/ContentScriptApp/components/messageBox/ResponseMessageBox";
import ErrorMessageBox from "@pages/content/src/ContentScriptApp/components/messageBox/ErrorMessageBox";
import { useMachine } from "@xstate/react";
import delayPromise from "@pages/content/src/ContentScriptApp/utils/delayPromise";
import dragStateMachine from "@pages/content/src/ContentScriptApp/xState/dragStateMachine";
import { sendMessageToBackgroundAsync } from "@src/chrome/message";
import styled from "@emotion/styled";
import { getPositionOnScreen } from "@pages/content/src/ContentScriptApp/utils/getPositionOnScreen";
import useSelectedSlot from "@pages/content/src/ContentScriptApp/hooks/useSelectedSlot";
import { Command as XCommand } from "@pages/content/src/ContentScriptApp/xState/dragStateMachine";
import promptTemplates from "./utils/promptTemplates";
import { chain, toLower } from "lodash";
// import the theme from those provided ...
import chrome from "react-command-palette/dist/themes/chrome-theme";
import "node_modules/react-command-palette/dist/themes/chrome.css";

const commands = [
  {
    id: XCommand.CITE_GOVERNING_LAW,
    name: "Cite Governing Law",
  },
  {
    id: XCommand.DRAFT_INTRODUCTION,
    name: "Draft Introduction (preamble)",
  },
  {
    id: XCommand.DRAFT_RECITALS,
    name: "Draft Recitals",
  },
  {
    id: XCommand.DRAFT_DEFINITIONS,
    name: "Create Definitions",
  },
  {
    id: XCommand.GENERATE_LANGUAGE,
    name: "Generate language",
    command() {
      console.log("Foo");
    },
  },
  {
    id: XCommand.RESEARCH,
    name: "Research",
    command() {
      console.log("Research");
    },
  },
];

const Container = styled.div`
  * {
    font-family: "Noto Sans KR", sans-serif;
  }
`;

const skipLoopCycleOnce = async () => await delayPromise(1);

async function getGPTResponse(
  userInput: string,
  command: XCommand = XCommand.NONE
) {
  return sendMessageToBackgroundAsync({
    type: "RequestOnetimeChatGPT",
    input: promptTemplates(userInput, command),
  });
}

export default function DragGPT() {
  const [isCommandTyped, setIsCommandTyped] = useState(false);
  const [commandInput, setCommandInput] = useState("");
  const toast = useToast();
  const selectedSlot = useSelectedSlot();
  const [state, send] = useMachine(dragStateMachine, {
    actions: {
      setPositionOnScreen: (context) => {
        const { left, width, height, top } = context.selectedTextNodeRect;
        const verticalCenter = left + width / 2;
        const horizontalCenter = top + height / 2;
        context.positionOnScreen = getPositionOnScreen({
          horizontalCenter,
          verticalCenter,
        });
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      copyToClipboard: (context: any) => {
        console.log("****copyToClipboard****", context.chats);
        return copy(
          chain(context).get("chats", []).last().get("content", "").value()
        );
      },
      showToast: () => {
        console.log("******showToast");
        toast({
          title: "Response copied to clipboard",
          description: "",
          status: "success",
          duration: 30000,
          isClosable: true,
        });
      },
    },
    services: {
      getGPTResponse: (context) =>
        getGPTResponse(context.selectedText, context.command),
    },
  });

  console.log("state", state.value, state.context);

  useEffect(() => {
    const onMouseUp = async (event: MouseEvent) => {
      /** Selection */
      await skipLoopCycleOnce();
      send({
        type: "TEXT_SELECTED",
        data: {
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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey && event.key === "j") {
        // Prevent default Cmd+J behavior (e.g., opening downloads)
        event.preventDefault();
        // Trigger your custom logic here
        send({
          type: "COMMAND_PALETTE",
        });
        console.log("Cmd+J pressed!");
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [send]);

  const requestGPT = () => {
    send("REQUEST");
  };

  const closeMessageBox = () => {
    send("CLOSE_MESSAGE_BOX");
  };

  return (
    <Container>
      {state.hasTag("showRequestButton") && (
        <GPTRequestButton
          onClick={requestGPT}
          loading={state.matches("loading")}
          top={state.context.requestButtonPosition.top}
          left={state.context.requestButtonPosition.left}
          selectedSlot={selectedSlot}
        />
      )}
      {state.hasTag("showResponseMessages") && (
        <ResponseMessageBox
          onClose={closeMessageBox}
          initialChats={state.context.chats}
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
      <CommandPalette
        open={state.hasTag("showCommandPalette")}
        onRequestClose={() => send("CLOSE_COMMAND_PALETTE")}
        resetInputOnOpen={true}
        highlightFirstSuggestion={false}
        filterSearchQuery={() => ""}
        onChange={(inputValue, userQuery) => {
          console.log("inputValue", inputValue);
          console.log("userQuery", userQuery);
          setCommandInput(inputValue);
        }}
        onHighlight={(highlightedIndex) => {
          console.log("highlightedIndex", highlightedIndex);
        }}
        onSelect={(item) => {
          console.log("onselect -> item", item);
          send({
            type: "EXECUTE_COMMAND",
            data: {
              selectedText: commandInput,
              command: ((i: any) => {
                switch (toLower(i.name || "")) {
                  case "generate language":
                    return XCommand.GENERATE_LANGUAGE;
                  case "research":
                    return XCommand.RESEARCH;
                  default:
                    return XCommand.NONE;
                }
              })(item),
            },
          });
        }}
        getSuggestionValue={(suggestion) => {
          console.log("getSuggestionValue -> suggestion", suggestion);
          return commandInput;
        }}
        trigger={null}
        commands={commands as Command[]}
        theme={chrome}
      />
    </Container>
  );
}
