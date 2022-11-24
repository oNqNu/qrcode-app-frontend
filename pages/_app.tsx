import { IconContext } from "react-icons";
import "../styles/globals.css";
import { ChakraProvider } from "@chakra-ui/react";
import type { AppProps } from "next/app";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <IconContext.Provider value={{ size: "100px" }}>
      <ChakraProvider>
        <Component {...pageProps} />
      </ChakraProvider>
    </IconContext.Provider>
  );
}

export default MyApp;
