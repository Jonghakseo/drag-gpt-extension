import { assign, createMachine } from "xstate";

type Events =
  | {
      type: "CHECK_API_KEY";
      data: string;
    }
  | {
      type: "RESET_API_KEY" | "CHANGE_QUICK_CHAT";
    };

interface Context {
  openAiApiKey: string | null;
  apiKeyCheckError?: Error;
}

type Services = {
  getApiKeyFromBackground: {
    data: string;
  };
  saveApiKeyToBackground: {
    data: void;
  };
};

const popupStateMachine = createMachine(
  {
    id: "popup-state",
    initial: "init",
    predictableActionArguments: true,
    schema: {
      context: {} as Context,
      events: {} as Events,
      services: {} as Services,
    },
    context: {
      openAiApiKey: null,
    },
    tsTypes: {} as import("./popupStateMachine.typegen").Typegen0,
    states: {
      init: {
        invoke: {
          src: "getApiKeyFromBackground",
          onDone: {
            target: "has_api_key",
            actions: "setApiKey",
          },
          onError: {
            target: "no_api_key",
          },
        },
      },
      has_api_key: {
        on: {
          RESET_API_KEY: {
            target: "no_api_key",
            actions: ["resetOpenAiApiKey", "resetApiKeyFromBackground"],
          },
          CHANGE_QUICK_CHAT: "quick_chat",
        },
      },
      no_api_key: {
        tags: "noApiKeyPage",
        on: {
          CHECK_API_KEY: {
            target: "checking_api_key",
            actions: "setApiKey",
          },
        },
      },
      quick_chat: {},
      checking_api_key: {
        tags: "noApiKeyPage",
        invoke: {
          src: "saveApiKeyToBackground",
          onDone: { target: "has_api_key" },
          onError: {
            target: "no_api_key",
            actions: assign({ apiKeyCheckError: (_, event) => event.data }),
          },
        },
      },
    },
  },
  {
    actions: {
      setApiKey: assign({
        openAiApiKey: (_, event) => event.data,
      }),
      resetOpenAiApiKey: assign({
        openAiApiKey: null,
      }),
    },
  }
);

export default popupStateMachine;
