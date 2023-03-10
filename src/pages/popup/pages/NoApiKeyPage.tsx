import React, { ChangeEventHandler, useState } from "react";
import { HStack, Input, Spinner, Text, VStack } from "@chakra-ui/react";
import Footer from "@pages/popup/components/layout/Footer";
import StyledButton from "@pages/popup/components/StyledButton";
import { COLORS } from "@src/constant/style";

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
        <Text color={COLORS.WHITE} pt={24}>
          Input openai api key
        </Text>
        {loading ? (
          <VStack spacing={20}>
            <Spinner width={30} height={30} color={COLORS.WHITE} />
            <Text color={COLORS.WHITE}>
              Currently sending a request to check for the API key...
            </Text>
          </VStack>
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
            <Text fontWeight="bold" color={COLORS.RED}>
              {apiKeyError.name}
            </Text>
            <Text whiteSpace="pre-wrap" color={COLORS.RED}>
              {apiKeyError.message}
            </Text>
          </VStack>
        )}
      </VStack>
      <Footer />
    </>
  );
};