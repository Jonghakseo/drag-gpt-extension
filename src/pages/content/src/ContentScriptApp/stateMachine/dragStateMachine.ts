import {
  getPositionOnScreen,
  PositionOnScreen,
} from "@pages/content/src/ContentScriptApp/utils/getPositionOnScreen";
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
  value: {
    selectedText: string;
    selectedNodeRect?: NodeRect;
    requestButtonPosition: RequestButtonPosition;
  };
};

type Events =
  | TextSelectedEvent
  | { type: "CLOSE_MESSAGE_BOX" }
  | { type: "REQUEST"; value: string };

interface Context {
  selectedText: string;
  selectedTextNodeRect: NodeRect;
  requestButtonPosition: RequestButtonPosition;
  positionOnScreen: PositionOnScreen;
  anchorNodePosition: AnchorNodePosition;
  responseText: string;
  error?: Error;
}

const initialContext: Context = {
  selectedText: "",
  responseText: "",
  requestButtonPosition: { top: 0, left: 0 },
  anchorNodePosition: { top: 0, center: 0, bottom: 0 },
  selectedTextNodeRect: { top: 0, left: 0, height: 0, width: 0 },
  positionOnScreen: PositionOnScreen.topLeft,
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
      services: {} as {
        getGPTResponse: {
          data: string;
        };
      },
    },
    tsTypes: {} as import("./dragStateMachine.typegen").Typegen0,
    states: {
      idle: {
        meta: {
          message: "idle state with nothing selected",
        },
        entry: ["resetAll"],
        on: {
          TEXT_SELECTED: {
            target: "request_button",
            actions: "readyRequestButton",
            cond: "isValidTextSelectedEvent",
          },
        },
      },
      request_button: {
        meta: {
          message: "the request button is visible",
        },
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
          REQUEST: "loading",
        },
      },
      loading: {
        meta: {
          message: "the loading spinner is running on the request button",
        },
        tags: "showRequestButton",
        entry: ["setAnchorNodePosition"],
        exit: ["setPositionOnScreen"],
        invoke: {
          src: "getGPTResponse",
          onDone: {
            target: "response_message_box",
            actions: assign({ responseText: (_, event) => event.data }),
          },
          onError: {
            target: "error_message_box",
            actions: assign({
              error: (_, event) => event.data,
            }),
          },
        },
      },
      response_message_box: {
        meta: {
          message: "receiving a normal response and showing the message box",
        },
        on: {
          CLOSE_MESSAGE_BOX: "idle",
        },
      },
      error_message_box: {
        meta: {
          message: "status showing error message box due to error occurrence",
        },
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
      setPositionOnScreen: assign({
        positionOnScreen: (context) => {
          const { left, width, height, top } = context.selectedTextNodeRect;
          const verticalCenter = left + width / 2;
          const horizontalCenter = top + height / 2;

          // warn: side effect can occur by window.innerWidth / window.innerHeight
          return getPositionOnScreen({
            verticalCenter,
            horizontalCenter,
          });
        },
      }),
      readyRequestButton: assign({
        selectedText: (_, event) => event.value.selectedText,
        selectedTextNodeRect: (context, event) =>
          event.value.selectedNodeRect ?? context.selectedTextNodeRect,
        requestButtonPosition: (_, event) => event.value.requestButtonPosition,
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
  if (!event.value.selectedNodeRect) {
    return false;
  }
  return event.value.selectedText.length > 1;
}

export default dragStateMachine;
