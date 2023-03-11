import { BoxProps, Box } from "@chakra-ui/react";
import { PropsWithChildren } from "react";

type UserChatProps = PropsWithChildren & Omit<BoxProps, "alignSelf">;

export default function UserChat({ ...restProps }: UserChatProps) {
  return <Box alignSelf="flex-end" {...restProps} />;
}
