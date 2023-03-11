export type PositionOnScreen =
  | "topLeft"
  | "topRight"
  | "bottomLeft"
  | "bottomRight";

export function getPositionOnScreen(position: {
  horizontalCenter: number;
  verticalCenter: number;
}): PositionOnScreen {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const isLeft = viewportWidth / 2 > position.verticalCenter;
  const isTop = viewportHeight / 2 > position.horizontalCenter;

  if (isTop && isLeft) {
    return "topLeft";
  }
  if (isTop && !isLeft) {
    return "topRight";
  }
  if (!isTop && isLeft) {
    return "bottomLeft";
  }
  // !isTop && !isLeft
  return "bottomRight";
}
