import { ComponentPropsWithRef, useEffect, useRef } from "react";
import styled from "@emotion/styled";
import { Spinner, Text } from "@chakra-ui/react";
import { COLORS, Z_INDEX } from "@src/constant/style";

const GAP = 4;

const StyledRequestButton = styled.button`
  border: none;
  padding: 0;
  position: absolute;
  z-index: ${Z_INDEX.ROOT};
  width: 20px;
  height: 20px;
  background: ${COLORS.PRIMARY};
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

type GPTRequestButtonProps = {
  top: number;
  left: number;
  loading: boolean;
} & ComponentPropsWithRef<"button">;

export default function GPTRequestButton({
  top,
  left,
  loading,
  ...restProps
}: GPTRequestButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!buttonRef.current) {
      return;
    }
    buttonRef.current.style.top = `${top + GAP}px`;
    buttonRef.current.style.left = `${left + GAP}px`;
  }, [buttonRef, top, left]);

  return (
    <StyledRequestButton
      aria-busy={loading}
      disabled={loading}
      ref={buttonRef}
      {...restProps}
    >
      {loading ? (
        <Spinner color="white" width={8} height={8} />
      ) : (
        <Text color="white">D</Text>
      )}
    </StyledRequestButton>
  );
}
