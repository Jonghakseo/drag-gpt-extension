export enum PositionOnScreen {
  topLeft,
  topRight,
  bottomLeft,
  bottomRight,
}
export function getPositionOnScreen(position: {
  horizontalCenter: number;
  verticalCenter: number;
}): PositionOnScreen {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const isLeft = viewportWidth / 2 > position.verticalCenter;
  const isTop = viewportHeight / 2 > position.horizontalCenter;

  if (isTop && isLeft) {
    return PositionOnScreen.topLeft;
  }
  if (isTop && !isLeft) {
    return PositionOnScreen.topRight;
  }
  if (!isTop && isLeft) {
    return PositionOnScreen.bottomLeft;
  }
  if (!isTop && !isLeft) {
    return PositionOnScreen.bottomRight;
  }
}
