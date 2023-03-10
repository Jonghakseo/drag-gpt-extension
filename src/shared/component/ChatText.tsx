import { Text } from "@chakra-ui/react";
import { PropsWithChildren } from "react";

type ChatTextProps = PropsWithChildren<{
  isError?: boolean;
  bold?: boolean;
  padding?: number;
  border?: boolean;
}>;

export default function ChatText({
  isError,
  bold,
  padding = 6,
  border = true,
  ...restProps
}: ChatTextProps) {
  return (
    <Text
      borderRadius={4}
      border={border ? "1px solid #f0ffff2e" : undefined}
      padding={padding}
      textAlign="start"
      color={isError ? "red" : "white"}
      lineHeight={1.3}
      fontWeight={bold ? "bold" : "normal"}
      {...restProps}
    />
  );
}
