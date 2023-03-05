import React, { ChangeEventHandler, useState } from "react";
import { ChromeMessenger } from "@pages/chrome/ChromeMessenger";
import { Button, HStack, Input, Spinner, Text, VStack } from "@chakra-ui/react";

type NoApiKeyPageProps = {
  updateOpenaiApiKey: (key: string) => void;
};
export const NoApiKeyPage = ({ updateOpenaiApiKey }: NoApiKeyPageProps) => {
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState<Error | null>(null);

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setApiKey(event.target.value);
  };

  const save = async () => {
    setLoading(true);
    setError(null);
    try {
      await ChromeMessenger.sendMessageAsync({
        type: "SaveAPIKey",
        data: apiKey,
      });
      updateOpenaiApiKey(apiKey);
    } catch (error) {
      if (error instanceof Error) {
        setError(error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
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
          <Button appearance="textfield" onClick={save}>
            SAVE
          </Button>
        </HStack>
      )}
      {error && (
        <VStack>
          <Text fontWeight="bold" color="red">
            {error.name}
          </Text>
          <Text whiteSpace="pre-wrap" color="#e84646">
            {error.message}
          </Text>
        </VStack>
      )}
    </VStack>
  );
};
