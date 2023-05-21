import { createContext } from "react";
import { useAddress } from "@thirdweb-dev/react";
import { Navbar } from "./components/Navbar";
import { About } from "./components/About";
import { Contacts } from "./components/Contacts";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

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

