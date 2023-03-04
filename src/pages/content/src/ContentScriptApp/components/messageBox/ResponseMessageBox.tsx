import MessageBox, {
  MessageBoxProps,
} from "@pages/content/src/ContentScriptApp/components/messageBox/MessageBox";

type ResponseMessageBoxProps = Omit<MessageBoxProps, "header" | "width">;

export default function ResponseMessageBox({
  ...restProps
}: ResponseMessageBoxProps) {
  return <MessageBox header="Response" width={480} {...restProps}></MessageBox>;
}
