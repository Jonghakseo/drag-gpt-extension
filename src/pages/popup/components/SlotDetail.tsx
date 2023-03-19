import {
  Box,
  HStack,
  Input,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Text,
  Textarea,
  Tooltip,
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";
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
        lineHeight={1.3}
      >
        {t("slotDetail_temperatureTitle")}
      </Text>
      <TemperatureSlider
        temperature={slot.temperature ?? 1}
        onChangeTemperature={(temperature) => {
          updateSlot("temperature", temperature);
        }}
      />
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
    <Box pt="6px" pb="2px" w="100%">
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
