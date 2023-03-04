export function getSelectionText(): string {
  return window.getSelection().toString();
}

export function getSelectionNodeRect() {
  return window.getSelection().getRangeAt(0).getBoundingClientRect();
}
