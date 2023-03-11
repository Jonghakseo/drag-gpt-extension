import { Link, Spacer, Text } from "@chakra-ui/react";
import React from "react";
import { t } from "@src/chrome/i18n";

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
          {t("footerEmailText")}
        </Text>
      </Link>
    </>
  );
}
