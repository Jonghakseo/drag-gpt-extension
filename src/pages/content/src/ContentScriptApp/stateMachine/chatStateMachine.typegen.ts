// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  internalEvents: {
    "done.invoke.chat-state.loading:invocation[0]": {
      type: "done.invoke.chat-state.loading:invocation[0]";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "error.platform.chat-state.loading:invocation[0]": {
      type: "error.platform.chat-state.loading:invocation[0]";
      data: unknown;
    };
    "xstate.init": { type: "xstate.init" };
  };
  invokeSrcNameMap: {
    getGPTResponse: "done.invoke.chat-state.loading:invocation[0]";
  };
  missingImplementations: {
    actions: "onExitChatting";
    delays: never;
    guards: never;
    services: "getGPTResponse";
  };
  eventsCausingActions: {
    addAssistantChat: "done.invoke.chat-state.loading:invocation[0]";
    addErrorChat: "error.platform.chat-state.loading:invocation[0]";
    addUserChat: "QUERY";
    onExitChatting: "EXIT";
    resetChatText: "QUERY";
    updateChatText: "CHANGE_TEXT";
  };
  eventsCausingDelays: {};
  eventsCausingGuards: {
    isValidText: "QUERY";
  };
  eventsCausingServices: {
    getGPTResponse: "QUERY";
  };
  matchesStates: "finish" | "idle" | "loading";
  tags: never;
}
