import { assign, createMachine } from "xstate";

type Events =
  | { type: "EXIT" | "QUERY" | "RESET" }
  | { type: "CHANGE_TEXT"; data: string };

interface Context {
  inputText: string;
  chats: Chat[];
  error?: Error;
}

type Services = {
  getGPTResponse: {
    data: { result: string };
  };
  getChatHistoryFromBackground: {
    data: Chat[];
  };
};

const initialContext: Context = {
  inputText: "",
  chats: [],
};

const chatStateMachine = createMachine(
  {
    id: "chat-state",
    initial: "init",
    predictableActionArguments: true,
    context: initialContext,
    schema: {
      context: {} as Context,
      events: {} as Events,
      services: {} as Services,
    },
    tsTypes: {} as import("./chatStateMachine.typegen").Typegen0,
    states: {
      init: {
        invoke: {
          src: "getChatHistoryFromBackground",
          onDone: { target: "idle", actions: "setChats" },
          onError: { target: "idle" },
        },
      },
      idle: {
        on: {
          QUERY: {
            target: "loading",
            actions: ["addUserChat", "resetChatText"],
            cond: "isValidText",
          },
          EXIT: "finish",
          RESET: { actions: "resetChatData" },
          CHANGE_TEXT: {
            actions: "updateChatText",
          },
        },
      },
      loading: {
        invoke: {
          src: "getGPTResponse",
          onDone: { target: "idle", actions: "addAssistantChat" },
          onError: { target: "idle", actions: "addErrorChat" },
        },
        on: {
          EXIT: "finish",
          RESET: { actions: "resetChatData" },
          CHANGE_TEXT: {
            actions: "updateChatText",
          },
        },
      },
      finish: {
        type: "final",
        entry: "exitChatting",
      },
    },
  },
  {
    actions: {
      setChats: assign({
        chats: (_, event) => event.data,
      }),
      addUserChat: assign({
        chats: (context) =>
          context.chats.concat({
            role: "user",
            content: context.inputText,
          }),
      }),
      addAssistantChat: assign({
        chats: (context, event) =>
          context.chats.concat({
            role: "assistant",
            content: event.data.result,
          }),
      }),
      addErrorChat: assign({
        chats: (context, event) => {
          const error: Error = event.data as Error;
          return context.chats.concat({
            role: "error",
            content: `${error?.name}\n${error?.message}`,
          });
        },
      }),
      updateChatText: assign({
        inputText: (_, event) => event.data,
      }),
      resetChatText: assign({
        inputText: () => "",
      }),
      resetChatData: assign({ chats: () => [] }),
    },
    guards: {
      isValidText: (context) => context.inputText.length > 0,
    },
  }
);

export default chatStateMachine;
