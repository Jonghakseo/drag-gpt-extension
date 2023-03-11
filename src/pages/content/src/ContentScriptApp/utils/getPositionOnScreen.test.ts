import { getPositionOnScreen } from "@pages/content/src/ContentScriptApp/utils/getPositionOnScreen";

declare let window: {
  innerWidth: number;
  innerHeight: number;
};

const originWidth = window.innerWidth;
const originHeight = window.innerHeight;

afterEach(() => {
  window.innerWidth = originWidth;
  window.innerHeight = originHeight;
});

describe("getPositionOnScreen test", () => {
  test("수평의 중간값이 화면의 중앙보다 위에 가깝고, 수직 중앙값이 화면의 중간보다 왼쪽에 가까우면 > 좌측 상단이다", () => {
    // given
    window.innerWidth = 1000;
    window.innerHeight = 1000;

    // when
    const position = getPositionOnScreen({
      horizontalCenter: 490,
      verticalCenter: 490,
    });

    // then
    expect(position).toEqual("topLeft");
  });
  test("수평의 중간값이 화면의 중앙보다 위에 가깝고, 수직 중앙값이 화면의 중간보다 오른쪽에 가까우면 > 우측 상단이다", () => {
    // given
    window.innerWidth = 1000;
    window.innerHeight = 1000;

    // when
    const position = getPositionOnScreen({
      horizontalCenter: 490,
      verticalCenter: 510,
    });

    // then
    expect(position).toEqual("topRight");
  });
  test("수평의 중간값이 화면의 중앙보다 아래에 가깝고, 수직 중앙값이 화면의 중간보다 왼쪽에 가까우면 > 좌측 하단이다", () => {
    // given
    window.innerWidth = 1000;
    window.innerHeight = 1000;

    // when
    const position = getPositionOnScreen({
      horizontalCenter: 510,
      verticalCenter: 490,
    });

    // then
    expect(position).toEqual("bottomLeft");
  });
  test("수평의 중간값이 화면의 중앙보다 위에 가깝고, 수직 중앙값이 화면의 중간보다 왼쪽에 가까우면 > 좌측 상단이다", () => {
    // given
    window.innerWidth = 1000;
    window.innerHeight = 1000;

    // when
    const position = getPositionOnScreen({
      horizontalCenter: 510,
      verticalCenter: 510,
    });

    // then
    expect(position).toEqual("bottomRight");
  });
});
