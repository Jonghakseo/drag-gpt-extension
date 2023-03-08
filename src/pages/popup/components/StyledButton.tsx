import styled from "@emotion/styled";
import { Button } from "@chakra-ui/react";
import { css } from "@emotion/react";

const StyledButton = styled(Button)`
  position: relative;
  cursor: pointer;
  outline: none;
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
  line-height: 14px;
  font-weight: bold;
  background-color: gainsboro;
  color: black;

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
          transition: all ease-in-out 200ms;
          background: #86a9ea;
        }
      `
    );
  }}
` as typeof Button;

export default StyledButton;
