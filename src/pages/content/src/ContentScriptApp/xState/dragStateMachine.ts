import type { PositionOnScreen } from "@pages/content/src/ContentScriptApp/utils/getPositionOnScreen";
import { assign, createMachine } from "xstate";

type NodeRect = { left: number; width: number; height: number; top: number };
type RequestButtonPosition = { top: number; left: number };
type AnchorNodePosition = {
  top: number;
  bottom: number;
  center: number;
};

type TextSelectedEvent = {
  type: "TEXT_SELECTED";
  data: {
    selectedText: string;
    selectedNodeRect?: NodeRect;
    requestButtonPosition: RequestButtonPosition;
  };
};

type CommandPaletteEvent = {
  type: "COMMAND_PALETTE";
};

type CommandSelected = {
  type: "EXECUTE_COMMAND";
  data: {
    selectedText: string;
    command: Command;
  };
};

type Events =
  | TextSelectedEvent
  | CommandPaletteEvent
  | CommandSelected
  | {
      type:
        | "CLOSE_MESSAGE_BOX"
        | "CLOSE_COMMAND_PALETTE"
        | "EXECUTE_COMMAND"
        | "copyToClipboard"
        | "REQUEST";
    };

// Define command enum
export enum Command {
  SUMMARIZE,
  DRAFT_RECITALS,
  DRAFT_INTRODUCTION,
  DRAFT_DEFINITIONS,
  CITE_GOVERNING_LAW,
  RESEARCH,
  GENERATE_LANGUAGE,
  NONE,
}

interface Context {
  chats: Chat[];
  selectedText: string;
  command: Command;
  selectedTextNodeRect: NodeRect;
  requestButtonPosition: RequestButtonPosition;
  positionOnScreen: PositionOnScreen;
  anchorNodePosition: AnchorNodePosition;
  error?: Error;
}

type Services = {
  getGPTResponse: {
    data: { result: string; tokenUsage: number };
  };
};

const initialContext: Context = {
  chats: [] as Chat[],
  selectedText: "",
  command: Command.NONE,
  requestButtonPosition: { top: 0, left: 0 },
  anchorNodePosition: { top: 0, center: 0, bottom: 0 },
  selectedTextNodeRect: { top: 0, left: 0, height: 0, width: 0 },
  positionOnScreen: "topLeft",
  error: undefined,
} as const;

const dragStateMachine = createMachine(
  {
    id: "drag-state",
    initial: "idle",
    predictableActionArguments: true,
    context: initialContext,
    schema: {
      context: {} as Context,
      events: {} as Events,
      services: {} as Services,
    },
    tsTypes: {} as import("./dragStateMachine.typegen").Typegen0,
    states: {
      idle: {
        entry: ["resetAll"],
        on: {
          TEXT_SELECTED: {
            target: "request_button",
            actions: "readyRequestButton",
            cond: "isValidTextSelectedEvent",
          },
          COMMAND_PALETTE: {
            target: "command_palette",
          },
        },
      },
      request_button: {
        tags: "showRequestButton",
        on: {
          TEXT_SELECTED: [
            {
              actions: "readyRequestButton",
              cond: "isValidTextSelectedEvent",
            },
            {
              target: "idle",
              cond: "isInvalidTextSelectedEvent",
            },
          ],
          REQUEST: { target: "loading", actions: "addRequestChat" },
        },
      },
      loading: {
        tags: "showRequestButton",
        entry: ["setAnchorNodePosition"],
        exit: ["setPositionOnScreen"],
        invoke: {
          src: "getGPTResponse",
          onDone: {
            target: "response_message_box",
            actions: "addResponseChat",
          },
          onError: {
            target: "error_message_box",
            actions: assign({
              error: (_, event) => event.data,
            }),
          },
        },
      },
      command_palette: {
        tags: "showCommandPalette",
        on: {
          EXECUTE_COMMAND: {
            target: "execute_command",
            actions: "readyCommandExecution",
          },
          CLOSE_COMMAND_PALETTE: "idle",
        },
      },
      execute_command: {
        tags: ["showCommandPalette", "executingCommand"],
        invoke: {
          src: "getGPTResponse",
          onDone: {
            target: "response_executed_command",
            actions: "addResponseChat",
          },
          onError: {
            target: "error_message_box",
            actions: assign({
              error: (_, event) => event.data,
            }),
          },
        },
      },
      response_executed_command: {
        always: [
          {
            target: "clipboard_copy",
          },
        ],
      },
      clipboard_copy: {
        exit: "copyToClipboard",
        always: [
          {
            target: "show_toast",
          },
        ],
      },
      show_toast: {
        entry: "showToast",
        always: [
          {
            target: "idle",
          },
        ],
      },
      response_message_box: {
        tags: "showResponseMessages",
        on: {
          CLOSE_MESSAGE_BOX: "idle",
        },
      },
      error_message_box: {
        on: {
          CLOSE_MESSAGE_BOX: "idle",
        },
      },
    },
  },
  {
    actions: {
      resetAll: assign({ ...initialContext }),
      setAnchorNodePosition: assign({
        anchorNodePosition: (context) => {
          const { left, width, height, top } = context.selectedTextNodeRect;
          const verticalCenter = left + width / 2;
          return {
            top: top + window.scrollY,
            bottom: top + height + window.scrollY,
            center: verticalCenter + window.scrollX,
          };
        },
      }),
      readyRequestButton: assign({
        selectedText: (_, event) => event.data.selectedText,
        selectedTextNodeRect: (context, event) =>
          event.data.selectedNodeRect ?? context.selectedTextNodeRect,
        requestButtonPosition: (_, event) => event.data.requestButtonPosition,
      }),
      readyCommandExecution: assign({
        selectedText: (_, event) => event.data.selectedText,
      }),
      addRequestChat: assign({
        chats: (context) =>
          context.chats.concat({ role: "user", content: context.selectedText }),
      }),
      addResponseChat: assign({
        chats: (context, event) =>
          context.chats.concat({
            role: "assistant",
            content: event.data.result,
          }),
      }),
    },
    guards: {
      isValidTextSelectedEvent: (_, event) => {
        return isValidTextSelectedEvent(event);
      },
      isInvalidTextSelectedEvent: (_, event) => {
        return !isValidTextSelectedEvent(event);
      },
    },
  }
);

function isValidTextSelectedEvent(event: TextSelectedEvent): boolean {
  if (!event.data.selectedNodeRect) {
    return false;
  }
  return event.data.selectedText.length > 1;
}

export default dragStateMachine;
