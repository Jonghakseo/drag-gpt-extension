export function createNewChatGPTSlot(config?: Partial<Slot>): Slot {
  return {
    type: "gpt4o",
    isSelected: false,
    id: generateId(),
    name: "",
    ...config,
  };
}

function generateId(): string {
  return `${Date.now()}${Math.random()}`;
}
