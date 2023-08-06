import {
  ChakraProvider,
  ColorModeScript,
  CSSReset,
  DarkMode,
  extendTheme,
  Spinner,
  ThemeConfig,
} from "@chakra-ui/react";
import { FC, Suspense } from "react";
import FontProvider from "@src/shared/component/FontProvider";
import OptionMainPage from "@pages/options/src/pages/Main";

const config: ThemeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

const theme = extendTheme({ config });

const App: FC = () => {
  return (
    <FontProvider>
      <DarkMode>
        <ChakraProvider theme={theme}>
          <CSSReset />
          {/*  TODO router */}
          <Suspense fallback={<Spinner size="lg" />}>
            <OptionMainPage />
          </Suspense>
        </ChakraProvider>
      </DarkMode>
    </FontProvider>
  );
};

export default App;
