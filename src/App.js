import { createContext } from "react";
import { useAddress } from "@thirdweb-dev/react"

import "./styles/Home.css";

import { LogIn } from "./components/LogIn";
import { Navbar } from "./components/Navbar";
import { OneInch } from "./components/OneInch";

export const WalletContext = createContext();

export function App() {

  const address = useAddress();

  return (
    <WalletContext.Provider value={address}>
      <div className="container">
      <main className="main">
        <Navbar />
        {!address? <LogIn /> : <OneInch />}
      </main>
    </div>
    </WalletContext.Provider>
  );
}

