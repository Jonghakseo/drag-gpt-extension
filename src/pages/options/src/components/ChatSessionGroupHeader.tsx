import { Button, HStack } from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";

type ChatSessionGroupHeaderProps = {
  deleteAllSessions: () => void;
};

export default function ChatSessionGroupHeader({
  deleteAllSessions,
}: ChatSessionGroupHeaderProps) {
  return (
    <HStack mb={2} as="header">
      <Button
        leftIcon={<DeleteIcon boxSize="12px" />}
        onClick={deleteAllSessions}
      >
        Delete All
      </Button>
    </HStack>
  );
}
