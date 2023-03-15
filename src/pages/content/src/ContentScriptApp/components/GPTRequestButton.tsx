import { ComponentPropsWithRef, CSSProperties } from "react";
import styled from "@emotion/styled";
import { Spinner, Text, Tooltip } from "@chakra-ui/react";
import { COLORS, Z_INDEX } from "@src/constant/style";
import { ChatIcon } from "@chakra-ui/icons";

const GAP = 4;

const StyledRequestButton = styled.button`
  border: none;
  padding: 0;
  position: absolute;
  z-index: ${Z_INDEX.ROOT};
  width: 20px;
  height: 20px;
  background: ${COLORS.CONTENT_BACKGROUND};
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  outline: none;
  box-shadow: none;

  &:hover {
    border: 1px solid #ffffff;
  }

  &:active {
    transform: scale(0.9);
    transition: all ease-in-out 100ms;
  }
`;

const labelTextInlineStyle: CSSProperties = {
  display: "block",
  fontSize: "13px",
  lineHeight: 1,
  margin: 0,
  maxWidth: "160px",
  overflow: "hidden",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
  fontFamily: "Noto Sans KR, sans-serif",
};

type GPTRequestButtonProps = {
  top: number;
  left: number;
  loading: boolean;
  selectedSlot?: Slot;
} & ComponentPropsWithRef<"button">;

export default function GPTRequestButton({
  top,
  left,
  loading,
  style,
  selectedSlot,
  ...restProps
}: GPTRequestButtonProps) {
  return (
    <Tooltip
      label={
        selectedSlot?.name && (
          <Text style={labelTextInlineStyle}>{selectedSlot.name}</Text>
        )
      }
    >
      <StyledRequestButton
        aria-busy={loading}
        disabled={loading}
        style={{
          ...style,
          top: `${top + GAP}px`,
          left: `${left + GAP}px`,
        }}
        {...restProps}
      >
        {loading ? (
          <Spinner color="white" width={8} height={8} />
        ) : (
          <ChatIcon aria-label="request" color="white" boxSize={12} />
        )}
      </StyledRequestButton>
    </Tooltip>
  );
}
