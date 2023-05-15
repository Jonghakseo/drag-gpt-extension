import {
  Box,
  Button,
  Checkbox,
  Container,
  Divider,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react";
// import { Logo } from "./Logo";
import { OAuthButtonGroup } from "../common/OAuthButtonGroup";

type NoApiKeyPageProps = {
  checkApiKey: (key: string) => void;
  apiKeyError?: Error;
  loading: boolean;
};

export const Signin = ({
  loading,
  checkApiKey,
  apiKeyError,
}: NoApiKeyPageProps) => (
  <Container
    maxW="lg"
    py={{ base: "12", md: "24" }}
    px={{ base: "0", sm: "6" }}
  >
    <Stack spacing="8">
      <Stack spacing="6">
        {/* <Logo /> */}
        <Stack spacing={{ base: "2", md: "3" }} textAlign="center">
          <Heading size={{ base: "xs", md: "sm" }}>Log in or Register</Heading>
        </Stack>
      </Stack>
      <Box
        py={{ base: "0", sm: "8" }}
        px={{ base: "4", sm: "10" }}
        bg={{ base: "transparent", sm: "bg-surface" }}
        boxShadow={{ base: "none", sm: "md" }}
        borderRadius={{ base: "none", sm: "xl" }}
      >
        <Stack spacing="6">
          <Stack spacing="5">
            <FormControl>
              <FormLabel htmlFor="email">Email</FormLabel>
              <Input id="email" type="email" />
            </FormControl>
          </Stack>
          <Stack spacing="6">
            <Button variant="primary">Sign in</Button>
            <HStack>
              <Divider />
              <Text fontSize="sm" whiteSpace="nowrap" color="muted">
                or continue with
              </Text>
              <Divider />
            </HStack>
            <OAuthButtonGroup />
          </Stack>
        </Stack>
      </Box>
    </Stack>
  </Container>
);
