import React from "react";
import { Heading, Link, Spacer } from "@chakra-ui/react";
import { ChromeMessenger } from "@pages/chrome/ChromeMessenger";
import { NoApiKeyPage } from "@pages/popup/components/NoApiKeyPage";
import HasApiKeyPage from "@pages/popup/components/HasApiKeyPage";
import "@pages/popup/Popup.css";
import styled from "@emotion/styled";
import { useMachine } from "@xstate/react";
import popupStateMachine from "@pages/popup/stateMachine/popupStateMachine";

const Container = styled.div`
  position: relative;
  width: 300px;
  min-height: 300px;

  display: flex;
  flex-direction: column;
  align-items: center;

  text-align: center;
  padding: 12px;
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
const getRole = () => {
  return ChromeMessenger.sendMessageAsync({
    type: "GetRole",
  });
};
const getApiKey = () => {
  return ChromeMessenger.sendMessageAsync({
    type: "GetAPIKey",
  });
};
const getAssistantPrompt = () => {
  return ChromeMessenger.sendMessageAsync({
    type: "GetAssistantPrompt",
  });
};

const saveRole = (role: string) => {
  ChromeMessenger.sendMessage({
    message: { type: "SetRole", data: role },
  });
};
const saveAssistantPrompt = (assistantPrompt: string) => {
  ChromeMessenger.sendMessage({
    message: { type: "SetAssistantPrompt", data: assistantPrompt },
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
      getRole,
      getApiKey,
      getAssistantPrompt,
    },
  });

  const resetOpenApiKey = () => {
    send("RESET_API_KEY");
    resetApiKey();
  };

  const checkApiKey = (apiKey: string) => {
    send({ type: "CHECK_API_KEY", data: apiKey });
  };

  const updateRole = (role: string) => {
    send({ type: "UPDATE_ROLE", data: role });
    saveRole(role);
  };
  const updateAssistantPrompt = (assistantPrompt: string) => {
    send({ type: "UPDATE_ASSISTANT_PROMPT", data: assistantPrompt });
    saveAssistantPrompt(assistantPrompt);
  };

  return (
    <Container>
      <Heading color="antiquewhite">Drag GPT</Heading>
      {state.matches("has_api_key") && (
        <HasApiKeyPage
          role={state.context.role ?? ""}
          assistantPrompt={state.context.assistantPrompt ?? ""}
          onClickChangeApiKey={resetOpenApiKey}
          updateRole={updateRole}
          updateAssistantPrompt={updateAssistantPrompt}
        />
      )}
      {state.hasTag("noApiKeyPage") && (
        <NoApiKeyPage
          apiKeyError={state.context.apiKeyCheckError}
          loading={state.matches("checking_api_key")}
          checkApiKey={checkApiKey}
        />
      )}

      <Spacer pt={16} />
      <Link
        fontWeight="bold"
        _hover={{ textDecor: "underline" }}
        textDecor="none"
        display="block"
        href="mailto:unqocn@gmail.com"
        color="white"
        mt="auto"
      >
        feature suggestions / bug reports
      </Link>
    </Container>
  );
}
