import { Link, Spacer } from "@chakra-ui/react";
import React from "react";

export default function Footer() {
  return (
    <>
      <Spacer pt={16} />
      <Link
        fontWeight="bold"
        _hover={{ textDecor: "underline" }}
        textDecor="none"
        display="block"
        href="mailto:unqocn@gmail.com"
        color="white"
        mt="auto"
      >
        feature suggestions / bug reports
      </Link>
    </>
  );
}
