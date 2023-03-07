import React from "react";
import { Heading } from "@chakra-ui/react";
import { ChromeMessenger } from "@pages/chrome/ChromeMessenger";
import { NoApiKeyPage } from "@pages/popup/components/NoApiKeyPage";
import SlotListPage from "@pages/popup/components/SlotListPage";
import "@pages/popup/Popup.css";
import styled from "@emotion/styled";
import { useMachine } from "@xstate/react";
import popupStateMachine from "@pages/popup/stateMachine/popupStateMachine";

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
  background-color: #282c34;

  p {
    margin: 0;
  }
`;

const saveApiKey = async (apiKey: string) => {
  await ChromeMessenger.sendMessageAsync({
    type: "SaveAPIKey",
    data: apiKey,
  });
};

const getApiKey = async () => {
  return ChromeMessenger.sendMessageAsync({
    type: "GetAPIKey",
  });
};

const resetApiKey = () => {
  ChromeMessenger.sendMessage({
    message: {
      type: "ResetAPIKey",
    },
  });
};

export default function MainPage() {
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
    <Container>
      <Heading color="antiquewhite">Drag GPT</Heading>
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
    </Container>
  );
}
