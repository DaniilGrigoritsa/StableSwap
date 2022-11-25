import { useState } from "react";
import { useAddress } from "@thirdweb-dev/react"

import "./styles/Home.css";

import { LogIn } from "./components/LogIn";
import { Navbar } from "./components/Navbar";
import { OneInch } from "./components/OneInch";


export function App() {

  const address = useAddress();

  return (
    <div className="container">
      <main className="main">
        <Navbar />
        {!address? <LogIn /> : <OneInch walletAddress={address}/>}
      </main>
    </div>
  );
}

