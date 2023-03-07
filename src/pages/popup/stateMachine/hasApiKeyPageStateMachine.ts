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
      data: Slot;
    }
  | {
      type: "DELETE_SLOT";
      slotId: string;
    }
  | {
      type: "UPDATE_SLOT";
      data: Slot;
    }
  | {
      type: "CHANGE_API_KEY";
    }
  | {
      type: "BACK";
    };

interface Context {
  slots: Slot[];
  selectedSlot?: Slot;
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
              selectedSlot: (context, event) =>
                context.slots.find((slot) => slot.id === event.slotId),
            }),
          },
          ADD_SLOT: {
            actions: "addSlot",
          },
          CHANGE_API_KEY: {
            target: "init",
            actions: "exitPage",
          },
          DELETE_SLOT: {
            actions: assign({
              slots: (context, event) =>
                context.slots.filter((slot) => slot.id !== event.slotId),
            }),
          },
          SELECT_SLOT: {
            actions: assign({
              slots: (context, event) =>
                context.slots.map((slot) => ({
                  ...slot,
                  isSelected: slot.id === event.slotId,
                })),
            }),
          },
        },
      },
      slot_detail: {
        on: {
          BACK: {
            target: "slot_list",
            actions: assign({
              selectedSlot: () => undefined,
            }),
          },
          UPDATE_SLOT: {
            actions: "updateSlot",
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
          return context.slots.reduce<Slot[]>((tot, slot) => {
            if (slot.id === event.data.id) {
              return tot.concat(event.data);
            }
            return tot.concat(slot);
          }, []);
        },
      }),
    },
  }
);

export default hasApiKeyPageStateMachine;
