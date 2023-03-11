import {
  ComponentPropsWithRef,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
} from "react";
import styled from "@emotion/styled";
import { CloseButton, HStack, Stack, Text } from "@chakra-ui/react";
import type { PositionOnScreen } from "@pages/content/src/ContentScriptApp/utils/getPositionOnScreen";
import useRootOutsideClick from "@pages/content/src/ContentScriptApp/hooks/useRootOutsideClick";
import getSafePixel from "@pages/content/src/ContentScriptApp/utils/getSafePixel";
import { COLORS, Z_INDEX } from "@src/constant/style";
import DraggableBox from "@pages/content/src/ContentScriptApp/components/DraggableBox";

const GAP = 8;

const MessageBoxContainer = styled.div<{ width: number }>`
  background: ${COLORS.CONTENT_BACKGROUND};
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
  font-size: 14px;
  line-height: 16px;
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
  isOutsideClickDisabled?: boolean;
  anchorTop: number;
  anchorCenter: number;
  anchorBottom: number;
  header: ReactNode;
  content: ReactNode;
  footer?: ReactNode;
  width: number;
  onClose: () => void;
  positionOnScreen: PositionOnScreen;
} & ComponentPropsWithRef<"div">;

export default function MessageBox({
  anchorCenter,
  anchorTop,
  anchorBottom,
  header,
  width,
  content,
  onClose,
  positionOnScreen,
  footer,
  isOutsideClickDisabled,
  ...restProps
}: MessageBoxProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useRootOutsideClick({
    ref: containerRef,
    isDisabled: isOutsideClickDisabled,
    handler: onClose,
  });

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }
    const boxCenterPosition = anchorCenter - width / 2;
    const height = containerRef.current.getBoundingClientRect().height;

    switch (positionOnScreen) {
      case "topLeft":
      case "topRight": {
        containerRef.current.style.top = getSafePixel(anchorBottom + GAP);
        containerRef.current.style.left = getSafePixel(boxCenterPosition);
        return;
      }
      case "bottomLeft":
      case "bottomRight": {
        containerRef.current.style.top = getSafePixel(anchorTop - GAP - height);
        containerRef.current.style.left = getSafePixel(boxCenterPosition);
        return;
      }
    }
  }, [containerRef, anchorCenter, anchorBottom, anchorTop, positionOnScreen]);

  // TODO withDraggableBox 등으로 로직 추출
  const containerRefRect = useMemo(() => {
    return containerRef.current?.getBoundingClientRect();
  }, [containerRef.current]);

  return (
    <DraggableBox
      defaultX={containerRefRect?.x ?? 0}
      defaultY={containerRefRect?.y ?? 0}
    >
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
            {typeof content === "string" ? (
              <Text color="white">{content}</Text>
            ) : (
              content
            )}
          </HStack>
          {footer}
        </Stack>
      </MessageBoxContainer>
    </DraggableBox>
  );
}
