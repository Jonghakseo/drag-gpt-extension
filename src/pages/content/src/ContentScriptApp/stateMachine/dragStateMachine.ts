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

function isValidSelectionTextLength(selectionText: string) {
  return selectionText.length > 1;
}

type Events =
  | {
      type: "TEXT_SELECTED";
      value: {
        selectedText: string;
        selectedNodeRect?: NodeRect;
        requestButtonPosition: RequestButtonPosition;
      };
    }
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
  ResetContext = "ResetContext",
  CalcAnchorNodePosition = "CalcAnchorNodePosition",
  CalcPositionOnScreen = "CalcPositionOnScreen",
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
          message: "아무것도 선택되지 않은 대기 상태",
        },
        entry: [Action.ResetContext],
        on: {
          TEXT_SELECTED: {
            target: StateKey.RequestButton,
            actions: assign({
              selectedText: (_, event) => event.value.selectedText,
              selectedTextNodeRect: (_, event) =>
                event.value.selectedNodeRect as NodeRect,
              requestButtonPosition: (_, event) =>
                event.value.requestButtonPosition,
            }),
            cond: (_, event) => {
              return (
                isValidSelectionTextLength(event.value.selectedText) &&
                !!event.value.selectedNodeRect
              );
            },
          },
        },
      },
      [StateKey.RequestButton]: {
        meta: {
          message: "요청 버튼이 보이는 상태",
        },
        tags: StateTag.ShowRequestButton,
        on: {
          TEXT_SELECTED: [
            {
              target: StateKey.RequestButton,
              actions: assign({
                selectedText: (_, event) => event.value.selectedText,
                selectedTextNodeRect: (_, event) =>
                  event.value.selectedNodeRect as NodeRect,
                requestButtonPosition: (_, event) =>
                  event.value.requestButtonPosition,
              }),
              cond: (_, event) => {
                return (
                  isValidSelectionTextLength(event.value.selectedText) &&
                  !!event.value.selectedNodeRect
                );
              },
            },
            {
              target: StateKey.Idle,
              cond: (_, event) =>
                !isValidSelectionTextLength(event.value.selectedText) ||
                !event.value.selectedNodeRect,
            },
          ],
          REQUEST: StateKey.Loading,
        },
      },
      [StateKey.Loading]: {
        meta: {
          message: "요청 버튼에 로딩 스피너가 돌아가는 상태",
        },
        tags: StateTag.ShowRequestButton,
        entry: [Action.CalcAnchorNodePosition],
        exit: [Action.CalcPositionOnScreen],
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
          message: "정상적인 응답을 받아 메시지 박스를 보여주는 상태",
        },
        on: {
          CLOSE_MESSAGE_BOX: StateKey.Idle,
        },
      },
      [StateKey.ErrorMessageBox]: {
        meta: {
          message: "에러 발생으로 에러 메시지 박스를 보여주는 상태",
        },
        on: {
          CLOSE_MESSAGE_BOX: StateKey.Idle,
        },
      },
    },
  },
  {
    actions: {
      [Action.ResetContext]: assign({ ...initialContext }),
      [Action.CalcAnchorNodePosition]: assign({
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
      [Action.CalcPositionOnScreen]: assign({
        positionOnScreen: (context) => {
          const { left, width, height, top } = context.selectedTextNodeRect;
          const verticalCenter = left + width / 2;
          const horizontalCenter = top + height / 2;

          return getPositionOnScreen({
            verticalCenter,
            horizontalCenter,
          });
        },
      }),
    },
  }
);

const DragStateMachine = {
  machine: dragStateMachine,
  StateKey,
  StateTag,
};

export default DragStateMachine;
