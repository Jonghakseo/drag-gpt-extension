import React, { ReactNode } from "react";
import { Heading } from "@chakra-ui/react";
import styled from "@emotion/styled";
import { COLORS } from "@src/constant/style";
import { t } from "@src/chrome/i18n";

const Container = styled.div`
  position: relative;
  width: fit-content;
  height: fit-content;
  min-width: 300px;
  min-height: 300px;

  display: flex;
  flex-direction: column;
  align-items: center;

  text-align: center;
  padding: 24px;
  background-color: ${COLORS.POPUP_BACKGROUND};

  p {
    margin: 0;
  }
`;

type MainLayoutProps = {
  children: ReactNode;
};

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <Container>
      <Heading color="gray.50" pb={3} fontSize={18} fontWeight="bold">
        {t("dragGPT")}
      </Heading>
      {children}
    </Container>
  );
}
