import useBackgroundMessage from "@src/shared/hook/useBackgroundMessage";
import ChatHistoryMainLayout from "@pages/options/src/components/layout/ChatHistoryMainLayout";
import { Suspense, useState } from "react";
import ChatHistory from "@pages/options/src/components/ChatHistory";
import ChatSessionGroup from "@pages/options/src/components/ChatSessionGroup";
import { sendMessageToBackgroundAsync } from "@src/chrome/message";
import PleaseSelectSession from "@pages/options/src/components/PleaseSelectSession";
import ConditionalRender from "@pages/options/src/components/layout/ConditionalRender";
import ChatHistoryHeader from "@pages/options/src/components/ChatHistoryHeader";
import ChatSessionGroupHeader from "@pages/options/src/components/ChatSessionGroupHeader";
import EmptySession from "@pages/options/src/components/EmptySession";
import { Spinner } from "@chakra-ui/react";

export default function OptionMainPage() {
  const { data: chatHistories, refetch } = useBackgroundMessage({
    type: "GetAllChatHistory",
  });

  const hasChatHistories = Object.keys(chatHistories).length > 0;
  const sortedChatHistories = [
    ...Object.entries(chatHistories).sort(
      ([, a], [, b]) => a.createdAt - b.createdAt
    ),
  ];

  const lastUpdatedSessionId = [
    ...Object.entries(chatHistories).sort(
      ([, a], [, b]) => b.updatedAt - a.updatedAt
    ),
  ].at(0)?.[0];

  const [selectedSessionId, setSelectedSessionId] =
    useState(lastUpdatedSessionId);

  const onSelectSession = (sessionId: string) => {
    setSelectedSessionId(sessionId);
  };

  const afterDeleteSession = () => {
    setSelectedSessionId(undefined);
    refetch();
  };

  const deleteSelectedSession = async () => {
    if (!selectedSessionId) return;
    await sendMessageToBackgroundAsync({
      type: "DeleteChatHistorySession",
      input: selectedSessionId,
    });
    afterDeleteSession();
  };

  const deleteAllSession = async () => {
    await sendMessageToBackgroundAsync({
      type: "DeleteAllChatHistory",
    });
    afterDeleteSession();
  };

  return (
    <ChatHistoryMainLayout
      Aside={
        <ConditionalRender
          isRender={hasChatHistories}
          fallback={<EmptySession />}
        >
          <ChatSessionGroupHeader deleteAllSessions={deleteAllSession} />
          <ChatSessionGroup
            chatSessions={sortedChatHistories}
            selectedSessionId={selectedSessionId}
            onSelectSession={onSelectSession}
          />
        </ConditionalRender>
      }
      ChatHistory={
        <ConditionalRender
          isRender={!!selectedSessionId}
          fallback={<PleaseSelectSession />}
        >
          <ChatHistoryHeader deleteSelectedSession={deleteSelectedSession} />
          <Suspense fallback={<Spinner size="lg" />}>
            <ChatHistory
              paddingTop="14px"
              overflowY="scroll"
              sessionId={selectedSessionId ?? ""}
            />
          </Suspense>
        </ConditionalRender>
      }
    />
  );
}
