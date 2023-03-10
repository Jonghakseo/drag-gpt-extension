import { HStack, Text, VStack } from "@chakra-ui/react";
import StyledButton from "@pages/popup/components/StyledButton";

type QuickChattingPageProps = {
  onClickBackButton: () => void;
};

export default function QuickChattingPage({
  onClickBackButton,
}: QuickChattingPageProps) {
  return (
    <VStack>
      <HStack>
        <Text>Quick Chat</Text>
        <StyledButton onClick={onClickBackButton}>BACK</StyledButton>
      </HStack>
    </VStack>
  );
}
