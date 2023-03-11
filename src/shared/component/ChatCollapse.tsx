import { Box, BoxProps, Collapse, StatUpArrow, VStack } from "@chakra-ui/react";
import {
  CSSProperties,
  MouseEventHandler,
  PropsWithChildren,
  useState,
} from "react";
import styled from "@emotion/styled";
import { css } from "@emotion/react";
import { COLORS } from "@src/constant/style";

type ChatCollapseProps = BoxProps &
  PropsWithChildren<{
    arrowColor?: CSSProperties["color"];
  }> &
  Omit<BoxProps, "alignSelf">;

export default function ChatCollapse({
  children,
  onClick,
  arrowColor = "white",
  ...restProps
}: ChatCollapseProps) {
  const [show, setShow] = useState(false);

  const closeCollapse = () => setShow(false);
  const openCollapse: MouseEventHandler<HTMLDivElement> = (event) => {
    setShow(true);
    onClick?.(event);
  };

  return (
    <CollapseBox isShow={show} onClick={openCollapse} {...restProps}>
      <Collapse startingHeight={24} in={show} animateOpacity>
        {children}
        <VStack
          margin="4px auto 0"
          cursor="pointer"
          width="100%"
          onClick={(e) => {
            closeCollapse();
            e.stopPropagation();
          }}
        >
          <StatUpArrow color={arrowColor} />
        </VStack>
      </Collapse>
    </CollapseBox>
  );
}

const CollapseBox = styled(Box)<{ isShow: boolean }>`
  align-self: start;
  position: relative;
  ${(p) =>
    p.isShow ||
    css`
      cursor: pointer;
      &:before {
        content: "";
        position: absolute;
        top: 0;
        right: 0;
        left: 0;
        height: 100%;

        background-image: linear-gradient(
          0deg,
          ${COLORS.CONTENT_BACKGROUND} 0%,
          rgba(0, 0, 0, 0) 100%
        );
      }
    `}
`;
