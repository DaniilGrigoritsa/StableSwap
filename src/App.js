import { createContext } from "react";
import { Navbar } from "./components/Navbar";
import { About } from "./components/About";
import { Contacts } from "./components/Contacts";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import "./styles/Home.css";
import { MainPage } from "./components/MainPage";

// import { Wallet } from "./components/Wallet";
import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { polygon, arbitrum } from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';
// import { publicProvider } from 'wagmi/providers/public';
// import { Chain } from 'wagmi/chains';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';

import { useAccount, useConnect, useDisconnect } from 'wagmi';


const avalancheChain = {
  id: 43_114,
  name: 'Avalanche',
  network: 'avalanche',
  iconUrl: 'https://cryptologos.cc/logos/avalanche-avax-logo.svg?v=025',
  iconBackground: '#fff',
  nativeCurrency: {
    decimals: 18,
    name: 'Avalanche',
    symbol: 'AVAX',
  },
  rpcUrls: {
    default: {
      http: ['https://api.avax.network/ext/bc/C/rpc'],
    },
  },
  blockExplorers: {
    default: { name: 'SnowTrace', url: 'https://snowtrace.io' },
    etherscan: { name: 'SnowTrace', url: 'https://snowtrace.io' },
  },
  testnet: false,
};

const { chains, publicClient } = configureChains(
  [arbitrum, polygon, avalancheChain],
  [
    alchemyProvider({ apiKey: process.env.ALCHEMY_ID }),
    jsonRpcProvider({
      rpc: chain => ({ http: chain.rpcUrls.default.http[0] }),
    }),
  ]
);

const { connectors } = getDefaultWallets({
  appName: 'Stable Swap',
  projectId: '',
  chains
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient
});


export const WalletContext = createContext();

export function App() {
  const { address, isConnected } = useAccount();

  return (
    <WalletContext.Provider value={address}>
      <div className="container">
      <main className="main">
        <WagmiConfig config={wagmiConfig}>
          <RainbowKitProvider chains={chains}>
            <Navbar/>
          </RainbowKitProvider>
        </WagmiConfig>
        <Router>
          <Routes>
            <Route element={<MainPage />} path="/" exact/>
            <Route element={<About />} path="/about" exact/>
            <Route element={<Contacts />} path="/contacts" exact/>
          </Routes>
        </Router>
      </main>
      </div>
    </WalletContext.Provider>
  );
}

