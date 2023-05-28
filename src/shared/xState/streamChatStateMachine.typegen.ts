// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  internalEvents: {
    "done.invoke.stream-chat-state.init:invocation[0]": {
      type: "done.invoke.stream-chat-state.init:invocation[0]";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "done.invoke.stream-chat-state.loading:invocation[0]": {
      type: "done.invoke.stream-chat-state.loading:invocation[0]";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "error.platform.stream-chat-state.loading:invocation[0]": {
      type: "error.platform.stream-chat-state.loading:invocation[0]";
      data: unknown;
    };
    "xstate.init": { type: "xstate.init" };
  };
  invokeSrcNameMap: {
    getChatHistoryFromBackground: "done.invoke.stream-chat-state.init:invocation[0]";
    getGPTResponse: "done.invoke.stream-chat-state.loading:invocation[0]";
  };
  missingImplementations: {
    actions: "exitChatting";
    delays: never;
    guards: never;
    services: "getChatHistoryFromBackground" | "getGPTResponse";
  };
  eventsCausingActions: {
    addErrorChat: "error.platform.stream-chat-state.loading:invocation[0]";
    addInitialAssistantChat: "done.invoke.stream-chat-state.loading:invocation[0]";
    addResponseToken: "RECEIVE_ING";
    addUserChat: "QUERY";
    execCancelReceive: "RECEIVE_CANCEL";
    exitChatting: "EXIT";
    replaceLastResponse: "RECEIVE_DONE";
    resetChatData: "RESET";
    resetChatText: "QUERY";
    setCancelReceive: "done.invoke.stream-chat-state.loading:invocation[0]";
    setChats: "done.invoke.stream-chat-state.init:invocation[0]";
    updateChatText: "CHANGE_TEXT";
  };
  eventsCausingDelays: {};
  eventsCausingGuards: {
    isValidText: "QUERY";
  };
  eventsCausingServices: {
    getChatHistoryFromBackground: "xstate.init";
    getGPTResponse: "QUERY";
  };
  matchesStates: "finish" | "idle" | "init" | "loading" | "receiving";
  tags: never;
}
