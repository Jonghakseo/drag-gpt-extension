import { ReactNode } from "react";
import { ChakraProvider } from "@chakra-ui/react";

export default function StyleProvider({ children }: { children: ReactNode }) {
  return <ChakraProvider>{children}</ChakraProvider>;
}
