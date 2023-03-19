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
  children,
  ...restProps
}: ChatTextProps) {
  return (
    <Text
      borderRadius={4}
      whiteSpace="pre-wrap"
      border={border ? "1px solid #f0ffff2e" : undefined}
      padding={`${padding}px`}
      textAlign="start"
      color={isError ? "red" : "white"}
      lineHeight={1.3}
      fontWeight={bold ? "bold" : "normal"}
      {...restProps}
    >
      {typeof children === "string" ? children.trim() : children}
    </Text>
  );
}
