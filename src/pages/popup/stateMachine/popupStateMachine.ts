import { assign, createMachine } from "xstate";

type Events =
  | {
      type: "CHECK_API_KEY";
      data: string;
    }
  | {
      type: "RESET_API_KEY";
    }
  | {
      type: "UPDATE_ROLE";
      data: string;
    }
  | {
      type: "UPDATE_ASSISTANT_PROMPT";
      data: string;
    };

interface Context {
  openAiApiKey: string | null;
  role?: string;
  assistantPrompt?: string;
  apiKeyCheckError?: Error;
}

type Services = {
  getApiKey: {
    data: string;
  };
  getRole: {
    data: string;
  };
  getAssistantPrompt: {
    data: string;
  };
  saveApiKey: {
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
          src: "getApiKey",
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
        invoke: [
          {
            src: "getRole",
            onDone: {
              actions: "setRole",
            },
          },
          {
            src: "getAssistantPrompt",
            onDone: {
              actions: "setAssistantPrompt",
            },
          },
        ],
        on: {
          RESET_API_KEY: {
            target: "no_api_key",
            actions: "resetOpenAiApiKey",
          },
          UPDATE_ROLE: {
            actions: "setRole",
          },
          UPDATE_ASSISTANT_PROMPT: {
            actions: "setAssistantPrompt",
          },
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
      checking_api_key: {
        tags: "noApiKeyPage",
        invoke: {
          src: "saveApiKey",
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
      setRole: assign({
        role: (_, event) => event.data,
      }),
      setApiKey: assign({
        openAiApiKey: (_, event) => event.data,
      }),
      setAssistantPrompt: assign({ assistantPrompt: (_, event) => event.data }),
      resetOpenAiApiKey: assign({
        openAiApiKey: null,
      }),
    },
  }
);

export default popupStateMachine;
