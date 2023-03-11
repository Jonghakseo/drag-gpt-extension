import MessageBox, {
  MessageBoxProps,
} from "@pages/content/src/ContentScriptApp/components/messageBox/MessageBox";
import { Text } from "@chakra-ui/react";
import styled from "@emotion/styled";
import { t } from "@src/chrome/i18n";

const ErrorHeaderText = styled(Text)`
  font-weight: bold;
  color: #ea3737;
`;

type ErrorMessageBoxProps = Omit<
  MessageBoxProps,
  "header" | "content" | "width"
> & {
  error?: Error;
};

export default function ErrorMessageBox({
  error,
  ...restProps
}: ErrorMessageBoxProps) {
  return (
    <MessageBox
      header={
        <ErrorHeaderText>{`${t("errorMessageBox_errorTitle")}: ${
          error?.name ?? t("errorMessageBox_unknownError")
        }`}</ErrorHeaderText>
      }
      width={400}
      content={error?.message ?? t("errorMessageBox_unknownError")}
      {...restProps}
    />
  );
}
