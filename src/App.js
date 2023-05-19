import { createContext } from "react";
import { useAddress } from "@thirdweb-dev/react";
import { Navbar } from "./components/Navbar";

import "./styles/Home.css";
import { MainPage } from "./components/MainPage";


export const WalletContext = createContext();

export function App() {

  const address = useAddress();

  return (
    <WalletContext.Provider value={address}>
      <div className="container">
      <main className="main">
        <Navbar/>
        <MainPage/>
      </main>
    </div>
    </WalletContext.Provider>
  );
}

