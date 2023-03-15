import { assign, createMachine } from "xstate";

type Events =
  | {
      type: "EDIT_SLOT" | "SELECT_SLOT" | "DELETE_SLOT";
      data: string;
    }
  | {
      type: "ADD_SLOT" | "UPDATE_SLOT";
      data: Slot;
    }
  | {
      type: "CHANGE_API_KEY" | "BACK_TO_LIST" | "GO_TO_PROMPT_GENERATOR";
    };

interface Context {
  slots: Slot[];
  editingSlot?: Slot;
}

type Services = {
  getAllSlotsFromBackground: {
    data: Slot[];
  };
};

const slotListPageStateMachine = createMachine(
  {
    id: "slot_list_page",
    initial: "init",
    predictableActionArguments: true,
    schema: {
      context: {} as Context,
      events: {} as Events,
      services: {} as Services,
    },
    context: {
      slots: [],
    },
    tsTypes: {} as import("./slotListPageStateMachine.typegen").Typegen0,
    states: {
      init: {
        invoke: {
          src: "getAllSlotsFromBackground",
          onDone: {
            target: "slot_list",
            actions: "setSlots",
          },
          onError: {
            target: "slot_list",
          },
        },
      },
      slot_list: {
        on: {
          EDIT_SLOT: {
            target: "slot_detail",
            actions: assign({
              editingSlot: (context, event) =>
                context.slots.find((slot) => slot.id === event.data),
            }),
          },
          GO_TO_PROMPT_GENERATOR: "prompt_generator",
          ADD_SLOT: {
            actions: ["addSlot", "addSlotMessageSendToBackground"],
          },
          CHANGE_API_KEY: {
            target: "init",
            actions: "exitPage",
          },
          DELETE_SLOT: {
            actions: ["deleteSlot", "deleteSlotMessageSendToBackground"],
          },
          SELECT_SLOT: {
            actions: ["selectSlot", "selectSlotMessageSendToBackground"],
          },
        },
      },
      prompt_generator: {
        on: {
          BACK_TO_LIST: "slot_list",
        },
      },
      slot_detail: {
        on: {
          BACK_TO_LIST: {
            target: "slot_list",
            actions: assign({
              editingSlot: () => undefined,
            }),
          },
          UPDATE_SLOT: {
            actions: ["updateSlot", "updateSlotMessageSendToBackground"],
          },
        },
      },
    },
  },
  {
    actions: {
      setSlots: assign({ slots: (_, event) => event.data }),
      addSlot: assign({
        slots: (context, event) => context.slots.concat(event.data),
      }),
      updateSlot: assign({
        slots: (context, event) => {
          return context.slots.reduce<Slot[]>((total, slot) => {
            const isUpdateTargetSlot = slot.id === event.data.id;
            if (isUpdateTargetSlot) {
              return [...total, event.data];
            }
            return [...total, slot];
          }, []);
        },
      }),
      deleteSlot: assign({
        slots: (context, event) =>
          context.slots.filter((slot) => slot.id !== event.data),
      }),
      selectSlot: assign({
        slots: (context, event) =>
          context.slots.map((slot) => ({
            ...slot,
            isSelected: slot.id === event.data,
          })),
      }),
    },
  }
);

export default slotListPageStateMachine;
