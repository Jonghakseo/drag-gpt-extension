export function createNewChatGPTSlot(config?: Partial<Slot>): Slot {
  return {
    type: "ChatGPT",
    isSelected: false,
    id: generateId(),
    name: "",
    ...config,
  };
}

function generateId(): string {
  return `${Date.now()}${Math.random()}`;
}
