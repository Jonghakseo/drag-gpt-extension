import styled from "@emotion/styled";

const Container = styled.main`
  display: grid;
  gap: 12px;
  grid-template-columns: 300px auto;
`;

const AsideWrapper = styled.aside`
  padding: 12px;
  max-height: 100vh;
  overflow-y: scroll;
`;

const SectionWrapper = styled.section`
  display: grid;
  grid-template-rows: auto 1fr;
  gap: 12px;
  padding: 12px 20px;
  width: 100%;
  height: 100vh;
`;

type ChatHistoryMainLayoutProps = {
  Aside: React.ReactNode;
  ChatHistory: React.ReactNode;
};

export default function ChatHistoryMainLayout({
  Aside,
  ChatHistory,
}: ChatHistoryMainLayoutProps) {
  return (
    <Container>
      <AsideWrapper>{Aside}</AsideWrapper>
      <SectionWrapper>{ChatHistory}</SectionWrapper>
    </Container>
  );
}
