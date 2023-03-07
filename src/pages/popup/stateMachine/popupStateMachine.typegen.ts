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
    getApiKey: "done.invoke.popup-state.init:invocation[0]";
    saveApiKey: "done.invoke.popup-state.checking_api_key:invocation[0]";
  };
  missingImplementations: {
    actions: never;
    delays: never;
    guards: never;
    services: "getApiKey" | "saveApiKey";
  };
  eventsCausingActions: {
    resetOpenAiApiKey: "RESET_API_KEY";
    setApiKey: "CHECK_API_KEY" | "done.invoke.popup-state.init:invocation[0]";
  };
  eventsCausingDelays: {};
  eventsCausingGuards: {};
  eventsCausingServices: {
    getApiKey: "xstate.init";
    saveApiKey: "CHECK_API_KEY";
  };
  matchesStates: "checking_api_key" | "has_api_key" | "init" | "no_api_key";
  tags: "noApiKeyPage";
}
