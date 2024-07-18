import {
  Box,
  Button,
  ButtonProps,
  HStack,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Text,
  Textarea,
  Tooltip,
  VStack,
} from "@chakra-ui/react";
import { forwardRef, ForwardRefRenderFunction, useState } from "react";
import styled from "@emotion/styled";
import StyledButton from "@pages/popup/components/StyledButton";
import { COLORS } from "@src/constant/style";
import { t } from "@src/chrome/i18n";

const StyledTextArea = styled(Textarea)`
  padding: 4px;
`;

type SlotDetailProps = {
  initialSlot: Slot;
  onUpdate: (slot: Slot) => void;
  exitDetail: () => void;
};

export default function SlotDetail({
  initialSlot,
  onUpdate,
  exitDetail,
}: SlotDetailProps) {
  const [slot, setSlot] = useState(initialSlot);

  const onSaveButtonClick = () => {
    onUpdate(slot);
    exitDetail();
  };

  const updateSlot = (key: keyof Slot, value: Slot[keyof Slot]) => {
    setSlot((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };

  return (
    <VStack spacing={3} alignItems="flex-start">
      <Text color={COLORS.WHITE} fontSize={12}>
        {t("slotDetail_promptSlotName")}
      </Text>
      <Input
        size="xs"
        value={slot.name}
        placeholder={t("slotDetail_promptSlotName_placeholder")}
        onChange={(event) => updateSlot("name", event.target.value)}
      />

      <Text
        color={COLORS.WHITE}
        textAlign="start"
        whiteSpace="pre-wrap"
        fontSize={12}
        lineHeight={1.3}
      >
        {t("slotDetail_writePromptTitle")}
      </Text>
      <StyledTextArea
        width={220}
        height={70}
        maxLength={2000}
        value={slot.system}
        placeholder={t("slotDetail_promptInputPlaceholder")}
        onChange={(event) => {
          updateSlot("system", event.target.value);
        }}
        size="xs"
      />

      <Text
        color={COLORS.WHITE}
        textAlign="start"
        whiteSpace="pre-wrap"
        fontSize={12}
      >
        {t("slotDetail_temperatureTitle")}
      </Text>
      <TemperatureSlider
        temperature={slot.temperature ?? 1}
        onChangeTemperature={(temperature) => {
          updateSlot("temperature", temperature);
        }}
      />
      <HStack>
        <Menu>
          <MenuButton as={forwardRef(ModelSelectButton)}>
            {slot.type}
          </MenuButton>
          <MenuList>
            <MenuItem onClick={() => updateSlot("type", "gpt-3.5-turbo")}>
              gpt-3.5-turbo
            </MenuItem>
            <MenuItem onClick={() => updateSlot("type", "gpt-4o")}>
              gpt-4o
            </MenuItem>
            <MenuItem onClick={() => updateSlot("type", "gpt-4-turbo")}>
              gpt-4-turbo
            </MenuItem>
          </MenuList>
        </Menu>
      </HStack>
      <HStack paddingTop={4} width="100%" justifyContent="space-between">
        <StyledButton onClick={onSaveButtonClick} colorScheme="blue">
          {t("slotDetail_saveButtonText")}
        </StyledButton>
        <StyledButton onClick={exitDetail}>
          {t("slotDetail_cancelButtonText")}
        </StyledButton>
      </HStack>
    </VStack>
  );
}

const ModelSelectButton: ForwardRefRenderFunction<
  HTMLButtonElement,
  ButtonProps
> = (props, ref) => {
  return <Button ref={ref} {...props} size="xs" />;
};

type TemperatureSliderProps = {
  temperature: number;
  onChangeTemperature: (temperature: number) => void;
};
const TemperatureSlider = ({
  temperature,
  onChangeTemperature,
}: TemperatureSliderProps) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <Box pb="2px" w="100%">
      <Slider
        min={0}
        max={2}
        step={0.1}
        value={temperature}
        aria-label="temperature-slider"
        onChange={(val) => onChangeTemperature(val)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <SliderTrack>
          <SliderFilledTrack />
        </SliderTrack>
        <Tooltip
          hasArrow
          bg="gray.500"
          color="white"
          placement="top"
          isOpen={showTooltip}
          label={temperature}
        >
          <SliderThumb />
        </Tooltip>
      </Slider>
    </Box>
  );
};
