import { render, screen } from "@testing-library/react";
import ErrorMessageBox from "@pages/content/src/ContentScriptApp/components/messageBox/ErrorMessageBox";
import { t } from "@src/chrome/i18n";

describe("ErrorMessageBox", () => {
  test("에러가 없으면 알 수 없는 에러 이름과 메시지가 노출된다", async () => {
    // when
    render(
      <ErrorMessageBox
        anchorTop={0}
        anchorCenter={0}
        anchorBottom={0}
        onClose={jest.fn}
        positionOnScreen="topLeft"
      />
    );

    // then
    screen.getByText(new RegExp(t("errorMessageBox_errorTitle")));
    screen.getByText(t("errorMessageBox_unknownError"));
  });
  test("에러가 있으면 에러 이름과 에러 메시지가 노출된다", async () => {
    // given
    const customError = new Error();
    customError.name = "custom error name";
    customError.message = "custom error message";

    // when
    render(
      <ErrorMessageBox
        error={customError}
        anchorTop={0}
        anchorCenter={0}
        anchorBottom={0}
        onClose={jest.fn}
        positionOnScreen="topLeft"
      />
    );

    // then
    screen.getByText(new RegExp(customError.name));
    screen.getByText(customError.message);
  });
});
