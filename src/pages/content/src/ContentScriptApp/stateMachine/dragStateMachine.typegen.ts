// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  internalEvents: {
    "done.invoke.drag-state.chat_loading_message_box:invocation[0]": {
      type: "done.invoke.drag-state.chat_loading_message_box:invocation[0]";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "done.invoke.drag-state.loading:invocation[0]": {
      type: "done.invoke.drag-state.loading:invocation[0]";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "error.platform.drag-state.chat_loading_message_box:invocation[0]": {
      type: "error.platform.drag-state.chat_loading_message_box:invocation[0]";
      data: unknown;
    };
    "error.platform.drag-state.loading:invocation[0]": {
      type: "error.platform.drag-state.loading:invocation[0]";
      data: unknown;
    };
    "xstate.init": { type: "xstate.init" };
    "xstate.stop": { type: "xstate.stop" };
  };
  invokeSrcNameMap: {
    getAdditionalGPTResponse: "done.invoke.drag-state.chat_loading_message_box:invocation[0]";
    getGPTResponse: "done.invoke.drag-state.loading:invocation[0]";
  };
  missingImplementations: {
    actions: never;
    delays: never;
    guards: never;
    services: "getAdditionalGPTResponse" | "getGPTResponse";
  };
  eventsCausingActions: {
    addErrorChat: "error.platform.drag-state.chat_loading_message_box:invocation[0]";
    addRequestChat: "REQUEST_MORE_CHAT";
    addResponseChat:
      | "done.invoke.drag-state.chat_loading_message_box:invocation[0]"
      | "done.invoke.drag-state.loading:invocation[0]";
    readyRequestButton: "TEXT_SELECTED";
    resetAll: "CLOSE_MESSAGE_BOX" | "TEXT_SELECTED" | "xstate.init";
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
    getAdditionalGPTResponse: "REQUEST_MORE_CHAT";
    getGPTResponse: "REQUEST";
  };
  matchesStates:
    | "chat_loading_message_box"
    | "error_message_box"
    | "idle"
    | "loading"
    | "request_button"
    | "response_message_box";
  tags: "showRequestButton" | "showResponseMessages";
}
