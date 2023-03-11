// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  internalEvents: {
    "done.invoke.popup-state.init:invocation[0]": {
      type: "done.invoke.popup-state.init:invocation[0]";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "xstate.init": { type: "xstate.init" };
  };
  invokeSrcNameMap: {
    getApiKeyFromBackground: "done.invoke.popup-state.init:invocation[0]";
    saveApiKeyToBackground: "done.invoke.popup-state.checking_api_key:invocation[0]";
  };
  missingImplementations: {
    actions: "resetApiKeyFromBackground";
    delays: never;
    guards: never;
    services: "getApiKeyFromBackground" | "saveApiKeyToBackground";
  };
  eventsCausingActions: {
    resetApiKeyFromBackground: "RESET_API_KEY";
    resetOpenAiApiKey: "RESET_API_KEY";
    setApiKey: "CHECK_API_KEY" | "done.invoke.popup-state.init:invocation[0]";
  };
  eventsCausingDelays: {};
  eventsCausingGuards: {};
  eventsCausingServices: {
    getApiKeyFromBackground: "xstate.init";
    saveApiKeyToBackground: "CHECK_API_KEY";
  };
  matchesStates:
    | "checking_api_key"
    | "init"
    | "no_api_key"
    | "quick_chat"
    | "slot_list_page";
  tags: "noApiKeyPage";
}
