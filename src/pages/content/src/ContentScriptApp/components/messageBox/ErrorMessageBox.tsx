import MessageBox, {
  MessageBoxProps,
} from "@pages/content/src/ContentScriptApp/components/messageBox/MessageBox";
import { Text } from "@chakra-ui/react";
import styled from "@emotion/styled";

const ErrorHeaderText = styled(Text)`
  font-weight: bold;
  color: #ea3737;
`;

type ErrorMessageBoxProps = Omit<
  MessageBoxProps,
  "header" | "text" | "width"
> & {
  error: Error;
};

export default function ErrorMessageBox({
  error,
  ...restProps
}: ErrorMessageBoxProps) {
  return (
    <MessageBox
      header={<ErrorHeaderText>{`Error: ${error.name}`}</ErrorHeaderText>}
      width={400}
      text={error.message}
      {...restProps}
    />
  );
}
