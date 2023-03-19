import React from "react";
import { NoApiKeyPage } from "@pages/popup/pages/NoApiKeyPage";
import SlotListPage from "@pages/popup/pages/SlotListPage";
import { useMachine } from "@xstate/react";
import popupStateMachine from "@pages/popup/xState/popupStateMachine";
import {
  sendMessageToBackground,
  sendMessageToBackgroundAsync,
} from "@src/chrome/message";
import MainLayout from "@pages/popup/components/layout/MainLayout";
import QuickChattingPage from "@pages/popup/pages/QuickChattingPage";

const saveApiKeyToBackground = async (apiKey: string) => {
  await sendMessageToBackgroundAsync({
    type: "SaveAPIKey",
    input: apiKey,
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

export default function Popup() {
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

  const checkApiKey = (apiKey: string) => {
    send({ type: "CHECK_API_KEY", data: apiKey });
  };

  return (
    <MainLayout>
      {state.matches("slot_list_page") && (
        <SlotListPage
          onClickChangeApiKey={() => send("RESET_API_KEY")}
          onClickQuickChatButton={() => send("GO_TO_QUICK_CHAT")}
        />
      )}
      {state.hasTag("noApiKeyPage") && (
        <NoApiKeyPage
          apiKeyError={state.context.apiKeyCheckError}
          loading={state.matches("checking_api_key")}
          checkApiKey={checkApiKey}
        />
      )}
      {state.matches("quick_chat") && (
        <QuickChattingPage onClickBackButton={() => send("EXIT_QUICK_CHAT")} />
      )}
    </MainLayout>
  );
}
