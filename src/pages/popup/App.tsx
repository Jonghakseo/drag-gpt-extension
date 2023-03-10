import React from "react";
import { NoApiKeyPage } from "@pages/popup/pages/NoApiKeyPage";
import SlotListPage from "@pages/popup/pages/SlotListPage";
import { useMachine } from "@xstate/react";
import popupStateMachine from "@pages/popup/stateMachine/popupStateMachine";
import {
  sendMessageToBackground,
  sendMessageToBackgroundAsync,
} from "@src/chrome/message";
import MainLayout from "@pages/popup/components/layout/MainLayout";

const saveApiKeyToBackground = async (apiKey: string) => {
  await sendMessageToBackgroundAsync({
    type: "SaveAPIKey",
    data: apiKey,
  });
};

const getApiKeyFromBackground = async () => {
  return sendMessageToBackgroundAsync({
    type: "GetAPIKey",
  });
};

const resetApiKeyFromBackground = () => {
  sendMessageToBackground({
    message: {
      type: "ResetAPIKey",
    },
  });
};

export default function App() {
  const [state, send] = useMachine(popupStateMachine, {
    services: {
      saveApiKeyToBackground: (context) => {
        return saveApiKeyToBackground(context.openAiApiKey ?? "");
      },
      getApiKeyFromBackground,
    },
    actions: {
      resetApiKeyFromBackground,
    },
  });

  const resetOpenApiKey = () => {
    send("RESET_API_KEY");
  };

  const checkApiKey = (apiKey: string) => {
    send({ type: "CHECK_API_KEY", data: apiKey });
  };

  const changeQuickChat = () => {
    send("CHANGE_QUICK_CHAT");
  };

  return (
    <MainLayout>
      {state.matches("has_api_key") && (
        <SlotListPage
          onClickChangeApiKey={resetOpenApiKey}
          onClickQuickChatButton={changeQuickChat}
        />
      )}
      {state.hasTag("noApiKeyPage") && (
        <NoApiKeyPage
          apiKeyError={state.context.apiKeyCheckError}
          loading={state.matches("checking_api_key")}
          checkApiKey={checkApiKey}
        />
      )}
      {state.matches("quick_chat") && <div>quck</div>}
    </MainLayout>
  );
}
