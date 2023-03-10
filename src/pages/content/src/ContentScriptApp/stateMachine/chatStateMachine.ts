import { assign, createMachine } from "xstate";

type Events =
  | { type: "EXIT" | "QUERY" }
  | { type: "CHANGE_TEXT"; data: string };

export type Chat = {
  role: "user" | "assistant" | "error";
  content: string;
};

interface Context {
  chatText: string;
  chats: Chat[];
  leftToken: number;
  error?: Error;
}

type Services = {
  getGPTResponse: {
    data: ResponseGPTMessage["data"];
  };
};

const MAX_TOKEN = 4096 as const;
const initialContext: Context = {
  chatText: "",
  chats: [] as Chat[],
  leftToken: MAX_TOKEN,
} as const;

const chatStateMachine = createMachine(
  {
    id: "chat-state",
    initial: "idle",
    predictableActionArguments: true,
    context: initialContext,
    schema: {
      context: {} as Context,
      events: {} as Events,
      services: {} as Services,
    },
    tsTypes: {} as import("./chatStateMachine.typegen").Typegen0,
    states: {
      idle: {
        on: {
          QUERY: {
            target: "loading",
            actions: ["addUserChat", "resetChatText"],
            cond: "isValidText",
          },
          EXIT: "finish",
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
          CHANGE_TEXT: {
            actions: "updateChatText",
          },
        },
      },
      finish: {
        type: "final",
        entry: "onExitChatting",
      },
    },
  },
  {
    actions: {
      addUserChat: assign({
        chats: (context) =>
          context.chats.concat({ role: "user", content: context.chatText }),
      }),
      addAssistantChat: assign({
        chats: (context, event) =>
          context.chats.concat({
            role: "assistant",
            content: event.data.result,
          }),
        leftToken: (_, event) => MAX_TOKEN - event.data.tokenUsage,
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
        chatText: (_, event) => event.data,
      }),
      resetChatText: assign({
        chatText: () => "",
      }),
    },
    guards: {
      isValidText: (context) => context.chatText.length > 0,
    },
  }
);

export default chatStateMachine;
