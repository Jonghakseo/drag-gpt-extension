import { assign, createMachine } from "xstate";

type Events =
  | {
      type: "GENERATE";
    }
  | { type: "UPDATE_INPUT_TEXT"; data: string };

interface Context {
  inputText: string;
  error?: Error;
  outputPrompt?: string;
}

type Services = {
  getGeneratedPrompt: {
    data: string;
  };
};

const promptGeneratorStateMachine = createMachine(
  {
    id: "prompt-generator-state",
    initial: "idle",
    predictableActionArguments: true,
    schema: {
      context: {} as Context,
      events: {} as Events,
      services: {} as Services,
    },
    context: {
      inputText: "",
    },
    tsTypes: {} as import("./promptGeneratorStateMachine.typegen").Typegen0,
    states: {
      idle: {
        on: {
          UPDATE_INPUT_TEXT: {
            actions: assign({ inputText: (_, event) => event.data }),
          },
          GENERATE: "loading",
        },
      },
      loading: {
        entry: ["resetError", "resetOutputPrompt"],
        invoke: {
          src: "getGeneratedPrompt",
          onDone: {
            target: "idle",
            actions: assign({ outputPrompt: (_, event) => event.data }),
          },
          onError: {
            target: "idle",
            actions: assign({ error: (_, event) => event.data }),
          },
        },
      },
    },
  },
  {
    actions: {
      resetError: assign({
        error: () => undefined,
      }),
      resetOutputPrompt: assign({ outputPrompt: () => undefined }),
    },
  }
);

export default promptGeneratorStateMachine;
