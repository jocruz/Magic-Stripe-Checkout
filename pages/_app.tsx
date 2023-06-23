import { ChainId, ThirdwebProvider } from "@thirdweb-dev/react";
//import { MagicConnector } from "@thirdweb-dev/react/evm/connectors/magic";
import { magicLink } from "@thirdweb-dev/react";
import type { AppProps } from "next/app";
import "../styles/globals.css";

// This is the chainId your dApp will work on.
const activeChainId = ChainId.Polygon;

// const magicLinkConnector = new MagicConnector({
//   options: {
//     apiKey: process.env.NEXT_PUBLIC_MAGIC_LINK_API_KEY as string,
//     rpcUrls: {
//       [ChainId.Polygon]: "https://rpc-mainnet.matic.quiknode.pro",
//     },
//   },
// });

const magicLinkConnector =  magicLink({ apiKey: process.env.NEXT_PUBLIC_MAGIC_LINK_API_KEY as string,  type: 'connect' })

// Array of wallet connectors you want to use for your dApp.
const connectors = [magicLinkConnector];

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThirdwebProvider
      activeChain={activeChainId}
      walletConnectors={connectors}
    >
      <Component {...pageProps} />
    </ThirdwebProvider>
  );
}

export default MyApp;
