// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  internalEvents: {
    "xstate.init": { type: "xstate.init" };
  };
  invokeSrcNameMap: {
    getGeneratedPrompt: "done.invoke.prompt-generator-state.loading:invocation[0]";
  };
  missingImplementations: {
    actions: never;
    delays: never;
    guards: never;
    services: "getGeneratedPrompt";
  };
  eventsCausingActions: {
    resetError: "GENERATE";
    resetOutputPrompt: "GENERATE";
  };
  eventsCausingDelays: {};
  eventsCausingGuards: {};
  eventsCausingServices: {
    getGeneratedPrompt: "GENERATE";
  };
  matchesStates: "idle" | "loading";
  tags: never;
}
