import { ComponentPropsWithRef, ReactNode, useEffect, useRef } from "react";
import styled from "@emotion/styled";
import { CloseButton, HStack, Stack, Text } from "@chakra-ui/react";
import { PositionOnScreen } from "@pages/content/src/ContentScriptApp/utils/getPositionOnScreen";
import useRootOutsideClick from "@pages/content/src/ContentScriptApp/hooks/useRootOutsideClick";
import getSafePixel from "@pages/content/src/ContentScriptApp/utils/getSafePixel";
import { COLORS, Z_INDEX } from "@src/constant/style";

const GAP = 8;

const MessageBoxContainer = styled.div<{ width: number }>`
  background: ${COLORS.PRIMARY};
  display: flex;
  flex-direction: column;
  position: absolute;
  z-index: ${Z_INDEX.ROOT};

  white-space: pre-wrap;

  width: ${(p) => p.width}px;
  min-width: ${(p) => p.width}px;
  max-width: ${(p) => p.width}px;

  border-radius: 6px;
  padding: 12px;

  p {
    margin: 0;
  }
`;

const StyledCloseButton = styled(CloseButton)`
  cursor: pointer;
  margin: 0;
  background: transparent;
  border: none;
  outline: none;
  padding: 6px;
  border-radius: 4px;

  &:active {
    outline: none;
    transform: scale(0.9);
    transition: all ease-in-out 100ms;
  }
`;

export type MessageBoxProps = {
  anchorTop: number;
  anchorCenter: number;
  anchorBottom: number;
  header: ReactNode;
  text: string;
  width: number;
  onClose: () => void;
  positionOnScreen: PositionOnScreen;
  footer?: ReactNode;
} & ComponentPropsWithRef<"div">;

export default function MessageBox({
  anchorCenter,
  anchorTop,
  anchorBottom,
  header,
  width,
  text,
  onClose,
  positionOnScreen,
  footer,
  ...restProps
}: MessageBoxProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useRootOutsideClick({ ref: containerRef, handler: onClose });

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }
    const boxCenterPosition = anchorCenter - width / 2;
    const height = containerRef.current.getBoundingClientRect().height;

    switch (positionOnScreen) {
      case PositionOnScreen.topLeft:
      case PositionOnScreen.topRight: {
        containerRef.current.style.top = getSafePixel(anchorBottom + GAP);
        containerRef.current.style.left = getSafePixel(boxCenterPosition);
        return;
      }
      case PositionOnScreen.bottomLeft:
      case PositionOnScreen.bottomRight: {
        containerRef.current.style.top = getSafePixel(anchorTop - GAP - height);
        containerRef.current.style.left = getSafePixel(boxCenterPosition);
        return;
      }
    }
  }, [containerRef, anchorCenter, anchorBottom, anchorTop, positionOnScreen]);

  return (
    <MessageBoxContainer width={width} ref={containerRef} {...restProps}>
      <Stack>
        <HStack justifyContent="space-between">
          {typeof header === "string" ? (
            <Text color="white" fontWeight="bold">
              {header}
            </Text>
          ) : (
            header
          )}
          <StyledCloseButton color="white" size="sm" onClick={onClose} />
        </HStack>
        <HStack>
          <Text color="white">{text}</Text>
        </HStack>
        {footer}
      </Stack>
    </MessageBoxContainer>
  );
}
