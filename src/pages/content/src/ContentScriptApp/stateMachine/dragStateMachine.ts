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

function isValidTextSelectedEvent(event: TextSelectedEvent): boolean {
  if (!event.value.selectedNodeRect) {
    return false;
  }
  return event.value.selectedText.length > 1;
}

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
  | { type: "RESOLVE"; responseText: string }
  | { type: "REJECT"; error: Error }
  | { type: "REQUEST"; value: string }
  | { type: "COUNTDOWN"; value: number };

interface Context {
  selectedText: string;
  selectedTextNodeRect: NodeRect;
  requestButtonPosition: RequestButtonPosition;
  positionOnScreen: PositionOnScreen;
  anchorNodePosition: AnchorNodePosition;
  responseText: string;
  error?: Error;
}

enum Action {
  ResetContextData = "ResetContextData",
  CalculateAnchorNodePosition = "CalculateAnchorNodePosition",
  CalculatePositionOnScreen = "CalculatePositionOnScreen",
  RequestButtonDataPreparation = "RequestButtonDataPreparation",
}

enum StateKey {
  Idle = "idle",
  RequestButton = "request_button",
  Loading = "loading",
  ResponseMessageBox = "response_message_box",
  ErrorMessageBox = "error_message_box",
}

enum StateTag {
  ShowRequestButton = "show_request_button",
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

const dragStateMachine = createMachine<Context, Events>(
  {
    id: "drag-state",
    initial: StateKey.Idle,
    predictableActionArguments: true,
    context: initialContext,
    states: {
      [StateKey.Idle]: {
        meta: {
          message: "idle state with nothing selected",
        },
        entry: [Action.ResetContextData],
        on: {
          TEXT_SELECTED: {
            target: StateKey.RequestButton,
            actions: [Action.RequestButtonDataPreparation],
            cond: (_, event) => isValidTextSelectedEvent(event),
          },
        },
      },
      [StateKey.RequestButton]: {
        meta: {
          message: "the request button is visible",
        },
        tags: StateTag.ShowRequestButton,
        on: {
          TEXT_SELECTED: [
            {
              target: StateKey.RequestButton,
              actions: [Action.RequestButtonDataPreparation],
              cond: (_, event) => isValidTextSelectedEvent(event),
            },
            {
              target: StateKey.Idle,
              cond: (_, event) => !isValidTextSelectedEvent(event),
            },
          ],
          REQUEST: StateKey.Loading,
        },
      },
      [StateKey.Loading]: {
        meta: {
          message: "the loading spinner is running on the request button",
        },
        tags: StateTag.ShowRequestButton,
        entry: [Action.CalculateAnchorNodePosition],
        exit: [Action.CalculatePositionOnScreen],
        on: {
          RESOLVE: {
            target: StateKey.ResponseMessageBox,
            actions: assign({
              responseText: (_, event) => event.responseText,
            }),
          },
          REJECT: {
            target: StateKey.ErrorMessageBox,
            actions: assign({
              error: (_, event) => event.error,
            }),
          },
        },
      },
      [StateKey.ResponseMessageBox]: {
        meta: {
          message: "receiving a normal response and showing the message box",
        },
        on: {
          CLOSE_MESSAGE_BOX: StateKey.Idle,
        },
      },
      [StateKey.ErrorMessageBox]: {
        meta: {
          message: "status showing error message box due to error occurrence",
        },
        on: {
          CLOSE_MESSAGE_BOX: StateKey.Idle,
        },
      },
    },
  },
  {
    actions: {
      [Action.ResetContextData]: assign({ ...initialContext }),
      [Action.CalculateAnchorNodePosition]: assign({
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
      [Action.CalculatePositionOnScreen]: assign({
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
      [Action.RequestButtonDataPreparation]: assign<Context, TextSelectedEvent>(
        {
          selectedText: (_, event) => event.value.selectedText,
          selectedTextNodeRect: (context, event) =>
            event.value.selectedNodeRect ?? context.selectedTextNodeRect,
          requestButtonPosition: (_, event) =>
            event.value.requestButtonPosition,
        }
      ),
    },
  }
);

const DragStateMachine = {
  machine: dragStateMachine,
  StateKey,
  StateTag,
};

export default DragStateMachine;
