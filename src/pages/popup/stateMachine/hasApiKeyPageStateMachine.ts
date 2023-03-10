import { assign, createMachine } from "xstate";

type Events =
  | {
      type: "SHOW_DETAIL";
      slotId: string;
    }
  | {
      type: "SELECT_SLOT";
      slotId: string;
    }
  | {
      type: "ADD_SLOT";
      slot: Slot;
    }
  | {
      type: "DELETE_SLOT";
      slotId: string;
    }
  | {
      type: "UPDATE_SLOT";
      slot: Slot;
    }
  | {
      type: "CHANGE_API_KEY";
    }
  | {
      type: "EXIT_DETAIL";
    };

interface Context {
  slots: Slot[];
  editingSlot?: Slot;
}

type Services = {
  getAllSlots: {
    data: Slot[];
  };
};

const hasApiKeyPageStateMachine = createMachine(
  {
    id: "has_api_key",
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
    tsTypes: {} as import("./hasApiKeyPageStateMachine.typegen").Typegen0,
    states: {
      init: {
        invoke: {
          src: "getAllSlots",
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
          SHOW_DETAIL: {
            target: "slot_detail",
            actions: assign({
              editingSlot: (context, event) =>
                context.slots.find((slot) => slot.id === event.slotId),
            }),
          },
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
      slot_detail: {
        on: {
          EXIT_DETAIL: {
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
        slots: (context, event) => context.slots.concat(event.slot),
      }),
      updateSlot: assign({
        slots: (context, event) => {
          return context.slots.reduce<Slot[]>((total, slot) => {
            const isUpdateTargetSlot = slot.id === event.slot.id;
            if (isUpdateTargetSlot) {
              return [...total, event.slot];
            }
            return [...total, slot];
          }, []);
        },
      }),
      deleteSlot: assign({
        slots: (context, event) =>
          context.slots.filter((slot) => slot.id !== event.slotId),
      }),
      selectSlot: assign({
        slots: (context, event) =>
          context.slots.map((slot) => ({
            ...slot,
            isSelected: slot.id === event.slotId,
          })),
      }),
    },
  }
);

export default hasApiKeyPageStateMachine;
