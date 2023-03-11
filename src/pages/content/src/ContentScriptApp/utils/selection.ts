export function getSelectionText(): string {
  return window.getSelection()?.toString() ?? "";
}

export function getSelectionNodeRect(): DOMRect | undefined {
  try {
    return (
      window.getSelection()?.getRangeAt(0)?.getBoundingClientRect() ?? undefined
    );
  } catch {
    return undefined;
  }
}
