// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  internalEvents: {
    "done.invoke.drag-state.loading:invocation[0]": {
      type: "done.invoke.drag-state.loading:invocation[0]";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "error.platform.drag-state.loading:invocation[0]": {
      type: "error.platform.drag-state.loading:invocation[0]";
      data: unknown;
    };
    "error.platform.drag-state.on_off_check:invocation[0]": {
      type: "error.platform.drag-state.on_off_check:invocation[0]";
      data: unknown;
    };
    "xstate.init": { type: "xstate.init" };
    "xstate.stop": { type: "xstate.stop" };
  };
  invokeSrcNameMap: {
    checkOnOffState: "done.invoke.drag-state.on_off_check:invocation[0]";
    getGPTResponse: "done.invoke.drag-state.loading:invocation[0]";
  };
  missingImplementations: {
    actions: "setPositionOnScreen";
    delays: never;
    guards: never;
    services: "checkOnOffState" | "getGPTResponse";
  };
  eventsCausingActions: {
    addInitialResponseChat: "done.invoke.drag-state.loading:invocation[0]";
    addRequestChat: "REQUEST";
    addResponseChatChunk: "RECEIVE_ING";
    readyRequestButton: "TEXT_SELECTED";
    resetAll:
      | "CLOSE_MESSAGE_BOX"
      | "RECEIVE_CANCEL"
      | "TEXT_SELECTED"
      | "error.platform.drag-state.on_off_check:invocation[0]"
      | "xstate.init";
    setAnchorNodePosition: "REQUEST";
    setPositionOnScreen:
      | "done.invoke.drag-state.loading:invocation[0]"
      | "error.platform.drag-state.loading:invocation[0]"
      | "xstate.stop";
  };
  eventsCausingDelays: {};
  eventsCausingGuards: {
    isInvalidTextSelectedEvent: "TEXT_SELECTED";
    isValidTextSelectedEvent: "TEXT_SELECTED";
  };
  eventsCausingServices: {
    checkOnOffState: "TEXT_SELECTED";
    getGPTResponse: "REQUEST";
  };
  matchesStates:
    | "error_message_box"
    | "idle"
    | "loading"
    | "on_off_check"
    | "request_button"
    | "response_message_box"
    | "temp_response_message_box";
  tags: "showRequestButton" | "showResponseMessages";
}
