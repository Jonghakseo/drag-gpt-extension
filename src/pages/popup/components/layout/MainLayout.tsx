import React, { ReactNode } from "react";
import styled from "@emotion/styled";
import { COLORS } from "@src/constant/style";

const Container = styled.div`
  position: relative;
  width: fit-content;
  height: fit-content;
  min-width: 440px;
  min-height: 300px;

  display: flex;
  gap: 8px;
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
      <img
        width={160}
        src={chrome.runtime.getURL("./logo-dark.png")}
        alt="logo"
      />
      {children}
    </Container>
  );
}
