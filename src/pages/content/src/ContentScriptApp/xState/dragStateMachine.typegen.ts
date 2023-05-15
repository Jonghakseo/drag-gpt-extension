
  // This file was automatically generated. Edits will be overwritten

  export interface Typegen0 {
        '@@xstate/typegen': true;
        internalEvents: {
          "": { type: "" };
"done.invoke.drag-state.execute_command:invocation[0]": { type: "done.invoke.drag-state.execute_command:invocation[0]"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"done.invoke.drag-state.loading:invocation[0]": { type: "done.invoke.drag-state.loading:invocation[0]"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"error.platform.drag-state.loading:invocation[0]": { type: "error.platform.drag-state.loading:invocation[0]"; data: unknown };
"xstate.init": { type: "xstate.init" };
"xstate.stop": { type: "xstate.stop" };
        };
        invokeSrcNameMap: {
          "getGPTResponse": "done.invoke.drag-state.execute_command:invocation[0]" | "done.invoke.drag-state.loading:invocation[0]";
        };
        missingImplementations: {
          actions: "copyToClipboard" | "setPositionOnScreen" | "showToast";
          delays: never;
          guards: never;
          services: "getGPTResponse";
        };
        eventsCausingActions: {
          "addRequestChat": "REQUEST";
"addResponseChat": "done.invoke.drag-state.execute_command:invocation[0]" | "done.invoke.drag-state.loading:invocation[0]";
"copyToClipboard": "" | "xstate.stop";
"readyCommandExecution": "EXECUTE_COMMAND";
"readyRequestButton": "TEXT_SELECTED";
"resetAll": "" | "CLOSE_COMMAND_PALETTE" | "CLOSE_MESSAGE_BOX" | "TEXT_SELECTED" | "xstate.init";
"setAnchorNodePosition": "REQUEST";
"setPositionOnScreen": "done.invoke.drag-state.loading:invocation[0]" | "error.platform.drag-state.loading:invocation[0]" | "xstate.stop";
"showToast": "";
        };
        eventsCausingDelays: {
          
        };
        eventsCausingGuards: {
          "isInvalidTextSelectedEvent": "TEXT_SELECTED";
"isValidTextSelectedEvent": "TEXT_SELECTED";
        };
        eventsCausingServices: {
          "getGPTResponse": "EXECUTE_COMMAND" | "REQUEST";
        };
        matchesStates: "clipboard_copy" | "command_palette" | "error_message_box" | "execute_command" | "idle" | "loading" | "request_button" | "response_executed_command" | "response_message_box" | "show_toast";
        tags: "executingCommand" | "showCommandPalette" | "showRequestButton" | "showResponseMessages";
      }
  