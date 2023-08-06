import styled from "@emotion/styled";

const Container = styled.main`
  display: grid;
  gap: 12px;
  grid-template-columns: 300px auto;
`;

type ChatHistoryMainLayoutProps = {
  Nav: React.ReactNode;
  ChatHistory: React.ReactNode;
};

export default function ChatHistoryMainLayout({
  Nav,
  ChatHistory,
}: ChatHistoryMainLayoutProps) {
  return (
    <Container>
      <nav>{Nav}</nav>
      <section>{ChatHistory}</section>
    </Container>
  );
}
