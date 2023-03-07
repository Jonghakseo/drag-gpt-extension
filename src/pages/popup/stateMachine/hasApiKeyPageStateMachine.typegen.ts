// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  internalEvents: {
    "done.invoke.has_api_key.init:invocation[0]": {
      type: "done.invoke.has_api_key.init:invocation[0]";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "xstate.init": { type: "xstate.init" };
  };
  invokeSrcNameMap: {
    getAllSlots: "done.invoke.has_api_key.init:invocation[0]";
  };
  missingImplementations: {
    actions: "exitPage";
    delays: never;
    guards: never;
    services: "getAllSlots";
  };
  eventsCausingActions: {
    addSlot: "ADD_SLOT";
    exitPage: "CHANGE_API_KEY";
    setSlots: "done.invoke.has_api_key.init:invocation[0]";
    updateSlot: "UPDATE_SLOT";
  };
  eventsCausingDelays: {};
  eventsCausingGuards: {};
  eventsCausingServices: {
    getAllSlots: "CHANGE_API_KEY" | "xstate.init";
  };
  matchesStates: "init" | "slot_detail" | "slot_list";
  tags: never;
}
