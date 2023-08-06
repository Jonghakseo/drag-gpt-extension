import { Button, HStack, StackProps } from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";

type ChatHistoryHeaderProps = {
  deleteSelectedSession: () => void;
} & StackProps;

export default function ChatHistoryHeader({
  deleteSelectedSession,
  ...restProps
}: ChatHistoryHeaderProps) {
  return (
    <HStack as="header" mb={2} {...restProps}>
      <Button
        leftIcon={<DeleteIcon boxSize="12px" />}
        onClick={deleteSelectedSession}
      >
        Delete Session
      </Button>
    </HStack>
  );
}
