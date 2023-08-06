import { SessionHistories } from "@pages/background/lib/storage/chatHistoryStorage";
import { Menu, MenuGroup, MenuItem, Text } from "@chakra-ui/react";

type ChatSessionGroupProps = {
  selectedSessionId?: string;
  onSelectSession: (sessionId: string) => unknown;
  chatSessions: [string, SessionHistories][];
};

export default function ChatSessionGroup({
  selectedSessionId,
  chatSessions,
  onSelectSession,
}: ChatSessionGroupProps) {
  const dragChatHistories = chatSessions.filter(
    ([, chat]) => chat.type === "Drag"
  );
  const quickChatHistories = chatSessions.filter(
    ([, chat]) => chat.type === "Quick"
  );

  return (
    <Menu>
      {quickChatHistories.length > 0 && (
        <MenuGroup title="QuickChatting">
          {quickChatHistories.map(([id, chats]) => (
            <MenuItem
              backgroundColor={
                id === selectedSessionId ? "blue.500" : undefined
              }
              key={id}
              onClick={() => onSelectSession(id)}
            >
              <Text>{new Date(chats.createdAt).toLocaleString()}</Text>
            </MenuItem>
          ))}
        </MenuGroup>
      )}
      {dragChatHistories.length > 0 && (
        <MenuGroup title="DragGPT">
          {dragChatHistories.map(([id, chats]) => (
            <MenuItem
              backgroundColor={
                id === selectedSessionId ? "blue.500" : undefined
              }
              key={id}
              onClick={() => onSelectSession(id)}
            >
              <Text>{new Date(chats.createdAt).toLocaleString()}</Text>
            </MenuItem>
          ))}
        </MenuGroup>
      )}
    </Menu>
  );
}
