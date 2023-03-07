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
  | { type: "REQUEST" }
  | { type: "REQUEST_MORE_CHAT"; data: string };

export type Chat = {
  role: "user" | "assistant" | "error";
  content: string;
};

interface Context {
  chats: Chat[];
  selectedText: string;
  selectedTextNodeRect: NodeRect;
  requestButtonPosition: RequestButtonPosition;
  positionOnScreen: PositionOnScreen;
  anchorNodePosition: AnchorNodePosition;
  error?: Error;
}

type Services = {
  getGPTResponse: {
    data: string;
  };
  getAdditionalGPTResponse: {
    data: string;
  };
};

const initialContext: Context = {
  chats: [] as Chat[],
  selectedText: "",
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
          REQUEST: "loading",
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
      response_message_box: {
        tags: "showResponseMessages",
        on: {
          CLOSE_MESSAGE_BOX: "idle",
          REQUEST_MORE_CHAT: {
            target: "chat_loading_message_box",
            actions: "addRequestChat",
          },
        },
      },
      chat_loading_message_box: {
        tags: "showResponseMessages",
        invoke: {
          src: "getAdditionalGPTResponse",
          onDone: {
            target: "response_message_box",
            actions: "addResponseChat",
          },
          onError: {
            target: "response_message_box",
            actions: "addErrorChat",
          },
        },
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
      addRequestChat: assign({
        chats: (context, event) =>
          context.chats.concat({ role: "user", content: event.data }),
      }),
      addResponseChat: assign({
        chats: (context, event) =>
          context.chats.concat({ role: "assistant", content: event.data }),
      }),
      addErrorChat: assign({
        chats: (context, event) => {
          const error: Error = event.data as Error;
          return context.chats.concat({
            role: "error",
            content: `${error?.name}\n${error?.message}`,
          });
        },
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
