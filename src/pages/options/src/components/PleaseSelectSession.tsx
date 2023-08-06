import { Text, VStack } from "@chakra-ui/react";
import { InfoIcon } from "@chakra-ui/icons";

export default function PleaseSelectSession() {
  return (
    <VStack p={8} alignItems="center" justifyContent="center">
      <InfoIcon boxSize="24px" />
      <Text>Please select session</Text>
    </VStack>
  );
}
