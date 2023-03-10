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

const saveApiKey = async (apiKey: string) => {
  await sendMessageToBackgroundAsync({
    type: "SaveAPIKey",
    data: apiKey,
  });
};

const getApiKey = async () => {
  return sendMessageToBackgroundAsync({
    type: "GetAPIKey",
  });
};

const resetApiKey = () => {
  sendMessageToBackground({
    message: {
      type: "ResetAPIKey",
    },
  });
};

export default function App() {
  const [state, send] = useMachine(popupStateMachine, {
    services: {
      saveApiKey: (context) => saveApiKey(context.openAiApiKey ?? ""),
      getApiKey,
    },
  });

  const resetOpenApiKey = () => {
    send("RESET_API_KEY");
    resetApiKey();
  };

  const checkApiKey = (apiKey: string) => {
    send({ type: "CHECK_API_KEY", data: apiKey });
  };

  return (
    <MainLayout>
      {state.matches("has_api_key") && (
        <SlotListPage onClickChangeApiKey={resetOpenApiKey} />
      )}
      {state.hasTag("noApiKeyPage") && (
        <NoApiKeyPage
          apiKeyError={state.context.apiKeyCheckError}
          loading={state.matches("checking_api_key")}
          checkApiKey={checkApiKey}
        />
      )}
    </MainLayout>
  );
}
