import styled from "@emotion/styled";
import { Button, ButtonProps } from "@chakra-ui/react";
import { css } from "@emotion/react";

const _StyledButton = styled(Button)`
  position: relative;
  cursor: pointer;
  outline: none;
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
  line-height: 14px;
  font-weight: bold;

  ${(p) => {
    return (
      p.isDisabled &&
      css`
        cursor: not-allowed;

        &:after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          bottom: 0;
          right: 0;
          background-color: rgba(255, 255, 255, 0.5);
          width: 100%;
          height: 100%;
          border-radius: 4px;
        }
      `
    );
  }};
  ${(p) => {
    return (
      p.isDisabled ||
      css`
        &:active {
          transition: all ease-in-out 100ms;
          transform: scale(0.95);
        }
        &:hover {
          outline: solid 1px white;
        }
        &:focus {
          outline: solid 1px white;
        }
      `
    );
  }}
` as typeof Button;

type StyledButtonProps = ButtonProps;

const StyledButton = ({ ...restProps }: StyledButtonProps) => {
  return (
    <_StyledButton
      colorScheme="whiteAlpha"
      variant="solid"
      size="sm"
      h="24px"
      {...restProps}
    />
  );
};

export default StyledButton;
