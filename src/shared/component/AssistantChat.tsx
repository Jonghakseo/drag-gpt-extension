import { BoxProps, Box } from "@chakra-ui/react";
import { PropsWithChildren } from "react";

type AssistantChatProps = PropsWithChildren & Omit<BoxProps, "alignSelf">;

export default function AssistantChat({ ...restProps }: AssistantChatProps) {
  return <Box alignSelf="flex-start" {...restProps} />;
}
