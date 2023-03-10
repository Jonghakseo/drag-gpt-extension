import getSafePixel from "@pages/content/src/ContentScriptApp/utils/getSafePixel";

describe("getSafePixel test", () => {
  test("양수 값을 넣으면 `$숫자}px`이 반환된다", async () => {
    // given
    const positiveNumber = 10;

    // when
    const result = getSafePixel(positiveNumber);

    // then
    expect(result).toEqual(`${positiveNumber}px`);
  });
  test("음수 값을 넣으면 0px이 반환된다", async () => {
    // given
    const negativeNumber = -10;

    // when
    const result = getSafePixel(negativeNumber);

    // then
    expect(result).toEqual("0px");
  });
});
