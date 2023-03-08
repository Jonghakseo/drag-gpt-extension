import { Box, HStack, Text } from "@chakra-ui/react";
import StyledButton from "@pages/popup/components/StyledButton";

type SlotListItemProps = {
  slotName: string;
  isSelected: boolean;
  onSelect: () => void;
  onDetail: () => void;
  onDelete: () => void;
};

export default function SlotListItem({
  slotName,
  isSelected,
  onDetail,
  onSelect,
  onDelete,
}: SlotListItemProps) {
  return (
    <Box
      width="100%"
      backgroundColor="white"
      cursor="pointer"
      padding={8}
      borderRadius={4}
      border="2px solid"
      borderColor={isSelected ? "#3F75E5FF" : "white"}
      onClick={onSelect}
    >
      <HStack justifyContent="space-between">
        <Text fontWeight="bold" fontSize={13}>
          {slotName}
        </Text>
        <HStack>
          <StyledButton
            onClick={(event) => {
              event.stopPropagation();
              onDetail();
            }}
          >
            <Text fontSize={11}>EDIT</Text>
          </StyledButton>
          <StyledButton
            onClick={(event) => {
              event.stopPropagation();
              onDelete();
            }}
          >
            <Text fontSize={11}>DEL</Text>
          </StyledButton>
        </HStack>
      </HStack>
    </Box>
  );
}
