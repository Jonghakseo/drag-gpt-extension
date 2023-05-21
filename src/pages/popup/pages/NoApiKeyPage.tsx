import React, { ChangeEventHandler, useState } from "react";
import {
  Button,
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
import { t } from "@src/chrome/i18n";

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
          <VStack spacing={5}>
            <Spinner width={7} height={7} color={COLORS.WHITE} />
            <Text color={COLORS.WHITE} whiteSpace="pre-wrap" lineHeight={1.4}>
              {t("noApiKeyPage_checkingApiKey")}
            </Text>
          </VStack>
        ) : (
          <>
            <HStack mb={3}>
              <Input
                value={apiKey}
                type="password"
                h="24px"
                onChange={handleChange}
                placeholder={t("noApiKeyPage_openAIApiKey_placeholder")}
                size="sm"
              />
              <StyledButton h="24px" size="md" onClick={onClickSaveButton}>
                {t("noApiKeyPage_saveButtonText")}
              </StyledButton>
            </HStack>

            <Text
              as="h3"
              fontSize={16}
              lineHeight={1.5}
              color={COLORS.WHITE}
              alignSelf="center"
            >
              {t("noApiKeyPage_howToGetApiKey")}
            </Text>
            <OrderedList
              spacing={1.5}
              paddingLeft={2}
              textAlign="start"
              color={COLORS.WHITE}
              fontSize={12}
              lineHeight="16px"
            >
              <li>
                {separateI18nAndAddLink(
                  t("noApiKeyPage_howToGetApiKeyDetail1"),
                  "https://platform.openai.com/signup"
                )}
              </li>
              <li>
                {separateI18nAndAddLink(
                  t("noApiKeyPage_howToGetApiKeyDetail2"),
                  "https://platform.openai.com/account/api-keys"
                )}
              </li>
              <li>{t("noApiKeyPage_howToGetApiKeyDetail3")}</li>
              <li>{t("noApiKeyPage_howToGetApiKeyDetail4")}</li>
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

const separateI18nAndAddLink = (text: string, link: string) => {
  const [prev, rest] = text.split("{");
  const [linkText, next] = rest.split("}");
  return (
    <>
      {prev}
      <Link color={COLORS.PRIMARY} href={link} target="_blank">
        {linkText}
      </Link>
      {next}
    </>
  );
};
