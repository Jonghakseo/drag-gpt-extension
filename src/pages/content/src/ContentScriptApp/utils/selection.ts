export function getSelectionText(): string {
  return window.getSelection()?.toString() ?? "";
}

export function getSelectionNodeRect(): DOMRect | undefined {
  try {
    const rect =
      window.getSelection()?.getRangeAt(0)?.getBoundingClientRect() ??
      undefined;
    return rect;
  } catch {
    return undefined;
  }
}
