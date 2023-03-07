import styled from "@emotion/styled";
import { Button } from "@chakra-ui/react";

const StyledButton = styled(Button)`
  cursor: pointer;
  outline: none;
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  font-weight: bold;
  background-color: gainsboro;
  color: black;

  &:active {
    transition: all ease-in-out 100ms;
    transform: scale(0.95);
  }

  &:hover {
    transition: all ease-in-out 200ms;
    background: #86a9ea;
  }
` as typeof Button;

export default StyledButton;
