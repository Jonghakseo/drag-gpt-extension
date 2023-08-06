import { Text, VStack } from "@chakra-ui/react";
import { InfoIcon } from "@chakra-ui/icons";

export default function EmptySession() {
  return (
    <VStack p={8} alignItems="center" justifyContent="center">
      <InfoIcon boxSize="12px" />
      <Text>Empty</Text>
    </VStack>
  );
}
