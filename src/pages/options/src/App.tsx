import { ChakraProvider, theme, ThemeProvider } from "@chakra-ui/react";
import { FC } from "react";
import ResetStyleProvider from "@src/shared/component/ResetStyleProvider";
import FontProvider from "@src/shared/component/FontProvider";

const App: FC = () => {
  return (
    <ResetStyleProvider>
      <FontProvider>
        <ChakraProvider>
          {/*  TODO router */}
          <ThemeProvider theme={theme}>Options</ThemeProvider>
        </ChakraProvider>
      </FontProvider>
    </ResetStyleProvider>
  );
};

export default App;
