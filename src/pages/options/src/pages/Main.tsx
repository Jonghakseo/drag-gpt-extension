import useBackgroundMessage from "@src/shared/hook/useBackgroundMessage";
import ChatHistoryMainLayout from "@pages/options/src/components/layout/ChatHistoryMainLayout";
import { Menu, MenuGroup, MenuItem, Text, VStack } from "@chakra-ui/react";
import { useState } from "react";
import ChatText from "@src/shared/component/ChatText";
import { ChatBox } from "@pages/content/src/ContentScriptApp/components/messageBox/ResponseMessageBox";

export default function OptionMainPage() {
  const chatHistories = useBackgroundMessage({
    type: "GetAllChatHistory",
  });
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  return (
    <ChatHistoryMainLayout
      Nav={
        <Menu>
          <MenuGroup title="group">
            {Object.entries(chatHistories).map(([id, chats]) => {
              return (
                <MenuItem key={id} onClick={() => setSelectedSessionId(id)}>
                  <div>
                    <Text textTransform="uppercase" display="block">
                      {chats.type}
                    </Text>
                    <Text display="block">
                      {new Date(chats.updatedAt).toLocaleString()}
                    </Text>
                  </div>
                </MenuItem>
              );
            })}
          </MenuGroup>
        </Menu>
      }
      ChatHistory={
        <VStack paddingTop="20px" paddingInline="20px" overflowY="scroll">
          {chatHistories[selectedSessionId]?.history.map((chat, index) => (
            <ChatBox chat={chat} key={index} />
          ))}
        </VStack>
      }
    />
  );
}
