import React, { ChangeEventHandler, useState } from "react";
import {
  Collapse,
  HStack,
  Input,
  Link,
  OrderedList,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
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
        {loading ? (
          <VStack spacing={20}>
            <Spinner width={30} height={30} color={COLORS.WHITE} />
            <Text color={COLORS.WHITE}>
              Currently sending a request to check for the API key...
            </Text>
          </VStack>
        ) : (
          <>
            <HStack mb={12}>
              <Input
                value={apiKey}
                type="password"
                onChange={handleChange}
                placeholder="open api key"
                size="sm"
              />
              <StyledButton onClick={onClickSaveButton}>SAVE</StyledButton>
            </HStack>

            <Text
              as="h3"
              fontSize={16}
              lineHeight={1.5}
              color={COLORS.WHITE}
              alignSelf="center"
            >
              How to get openai api key?
            </Text>
            <OrderedList
              spacing={4}
              paddingLeft={8}
              textAlign="start"
              color={COLORS.WHITE}
              fontSize={12}
              lineHeight="14px"
            >
              <li>
                <Link
                  color={COLORS.PRIMARY}
                  href="https://platform.openai.com/signup"
                  target="_blank"
                >
                  Sign up
                </Link>{" "}
                for an OpenAI account.
              </li>
              <li>
                Navigate to the{" "}
                <Link
                  color={COLORS.PRIMARY}
                  href="https://platform.openai.com/account/api-keys"
                  target="_blank"
                >
                  API key page
                </Link>
              </li>
              <li>Create a new secret key to generate an API key.</li>
              <li>
                Copy the key and paste it into the input field, then click save.
              </li>
            </OrderedList>
          </>
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
