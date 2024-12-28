import { Button, ButtonProps } from "@chakra-ui/react";

type StyledButtonProps = ButtonProps;

const StyledButton = ({ ...restProps }: StyledButtonProps) => {
  return (
    <Button
      color="whiteAlpha"
      variant="solid"
      size="sm"
      h="24px"
      style={{
        border: "none",
      }}
      {...restProps}
    />
  );
};

export default StyledButton;
