import React, { ChangeEventHandler, useState } from "react";
import { Button, HStack, Input, Spinner, Text, VStack } from "@chakra-ui/react";
import Footer from "@pages/popup/components/Footer";
import StyledButton from "@pages/popup/components/StyledButton";

type NoApiKeyPageProps = {
  checkApiKey: (key: string) => void;
  apiKeyError?: Error;
  loading: boolean;
};
export const NoApiKeyPage = ({
  loading,
  checkApiKey,
  apiKeyError,
}: NoApiKeyPageProps) => {
  const [apiKey, setApiKey] = useState("");

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setApiKey(event.target.value);
  };

  const onClickSaveButton = () => {
    checkApiKey(apiKey);
  };

  return (
    <>
      <VStack>
        <Text color="antiquewhite">Input openai api key</Text>
        {loading ? (
          <Spinner width={30} height={30} color="antiquewhite" />
        ) : (
          <HStack>
            <Input
              value={apiKey}
              type="password"
              onChange={handleChange}
              placeholder="open api key"
              size="sm"
            />
            <StyledButton onClick={onClickSaveButton}>SAVE</StyledButton>
          </HStack>
        )}
        {apiKeyError && (
          <VStack>
            <Text fontWeight="bold" color="red">
              {apiKeyError.name}
            </Text>
            <Text whiteSpace="pre-wrap" color="#e84646">
              {apiKeyError.message}
            </Text>
          </VStack>
        )}
      </VStack>
      <Footer />
    </>
  );
};
