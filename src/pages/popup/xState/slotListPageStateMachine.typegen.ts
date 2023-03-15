// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  internalEvents: {
    "done.invoke.slot_list_page.init:invocation[0]": {
      type: "done.invoke.slot_list_page.init:invocation[0]";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "xstate.init": { type: "xstate.init" };
  };
  invokeSrcNameMap: {
    getAllSlotsFromBackground: "done.invoke.slot_list_page.init:invocation[0]";
  };
  missingImplementations: {
    actions:
      | "addSlotMessageSendToBackground"
      | "deleteSlotMessageSendToBackground"
      | "exitPage"
      | "selectSlotMessageSendToBackground"
      | "updateSlotMessageSendToBackground";
    delays: never;
    guards: never;
    services: "getAllSlotsFromBackground";
  };
  eventsCausingActions: {
    addSlot: "ADD_SLOT";
    addSlotMessageSendToBackground: "ADD_SLOT";
    deleteSlot: "DELETE_SLOT";
    deleteSlotMessageSendToBackground: "DELETE_SLOT";
    exitPage: "CHANGE_API_KEY";
    selectSlot: "SELECT_SLOT";
    selectSlotMessageSendToBackground: "SELECT_SLOT";
    setSlots: "done.invoke.slot_list_page.init:invocation[0]";
    updateSlot: "UPDATE_SLOT";
    updateSlotMessageSendToBackground: "UPDATE_SLOT";
  };
  eventsCausingDelays: {};
  eventsCausingGuards: {};
  eventsCausingServices: {
    getAllSlotsFromBackground: "CHANGE_API_KEY" | "xstate.init";
  };
  matchesStates: "init" | "prompt_generator" | "slot_detail" | "slot_list";
  tags: never;
}
