import { Link, Spacer, Text } from "@chakra-ui/react";
import React from "react";

export default function Footer() {
  return (
    <>
      <Spacer pt={24} />
      <Link
        _hover={{ textDecor: "underline" }}
        textDecor="none"
        display="block"
        href="mailto:unqocn@gmail.com"
        mt="auto"
      >
        <Text color="white" fontSize={12} fontWeight="bold">
          feature suggestions / bug reports
        </Text>
      </Link>
    </>
  );
}
