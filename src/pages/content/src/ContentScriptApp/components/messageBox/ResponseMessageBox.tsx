import MessageBox, {
  MessageBoxProps,
} from "@pages/content/src/ContentScriptApp/components/messageBox/MessageBox";
import StyledButton from "@pages/popup/components/StyledButton";
import { useState } from "react";
import { HStack } from "@chakra-ui/react";

type ResponseMessageBoxProps = Omit<
  MessageBoxProps,
  "header" | "width" | "footer"
>;

export default function ResponseMessageBox({
  text,
  ...restProps
}: ResponseMessageBoxProps) {
  const [isCopied, setIsCopied] = useState(false);
  const copyResponse = async () => {
    await copyToClipboard(text);
    setIsCopied(true);
  };
  return (
    <MessageBox
      header="Response"
      width={480}
      footer={
        <HStack width="100%">
          <StyledButton onClick={copyResponse}>
            {isCopied ? "COPIED!" : "COPY"}
          </StyledButton>
        </HStack>
      }
      text={text}
      {...restProps}
    />
  );
}

async function copyToClipboard(text: string) {
  await navigator.clipboard.writeText(text);
}
