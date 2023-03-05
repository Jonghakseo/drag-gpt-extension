import React, { useLayoutEffect, useState } from "react";
import { Heading, Link, Spacer } from "@chakra-ui/react";
import { ChromeMessenger } from "@pages/chrome/ChromeMessenger";
import { NoApiKeyPage } from "@pages/popup/pages/NoApiKeyPage";
import HasApiKeyPage from "@pages/popup/pages/HasApiKeyPage";
import "@pages/popup/Popup.css";
import styled from "@emotion/styled";

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

export default function MainPage() {
  const [openaiApiKey, setOpenaiApiKey] = useState(null);
  const [role, setRole] = useState("");
  const [assistantPrompt, setAssistantPrompt] = useState("");

  const resetOpenApiKey = () => {
    setOpenaiApiKey("");
    ChromeMessenger.sendMessage({
      message: {
        type: "ResetAPIKey",
      },
    });
  };

  useLayoutEffect(() => {
    ChromeMessenger.sendMessage({
      message: {
        type: "GetAPIKey",
      },
      handleSuccess: setOpenaiApiKey,
    });
    ChromeMessenger.sendMessage({
      message: {
        type: "GetRole",
      },
      handleSuccess: setRole,
    });
    ChromeMessenger.sendMessage({
      message: {
        type: "GetAssistantPrompt",
      },
      handleSuccess: setAssistantPrompt,
    });
  }, []);

  return (
    <Container>
      <Heading color="antiquewhite">Drag GPT</Heading>
      {openaiApiKey ? (
        <HasApiKeyPage
          initialRole={role}
          initialAssistantPrompt={assistantPrompt}
          onClickChangeApiKey={resetOpenApiKey}
        />
      ) : (
        <NoApiKeyPage
          key={(!!openaiApiKey).toString()}
          openaiApiKey={openaiApiKey}
          updateOpenaiApiKey={setOpenaiApiKey}
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
