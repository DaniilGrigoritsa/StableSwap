import Web3 from "web3";
import { useState, useContext, createContext } from "react";
import { WalletContext } from "../App";
import { Link } from "react-router-dom";
import SupportedBlockchainsData from "../scripts/networks";
import sendTransaction from "../scripts/swapWithV3";
import cross from'../img/cross.png';

const web3 = new Web3(window.ethereum);
window.ethereum.enable();

export const GlobalContext = createContext();

function PopUp({setDisplayPopUp, setToken, dstChain}) {
  const availavleTokens = SupportedBlockchainsData[dstChain.id].tokens.map((token) => {
    return (
      <div key={token.name}>
        <button className="token" onClick={() => {
          setToken(token);
          setDisplayPopUp(false);
        }}>
          <img className="token-logo" src={token.logo}/>
          <p>{token.name}</p>
        </button>
      </div>
    )
  })
  return (
    <div className="pop-up">
      <img className="close" src={cross} alt="close" onClick={() => setDisplayPopUp(false)}/>
      <h1>Swap to</h1>
      {availavleTokens}
    </div>
  )
}

function ChainsPopUp({setDisplayChains, setDstChain}) {
  return (
    <div className="pop-up">
      <img className="close" src={cross} alt="close" onClick={() => setDisplayChains(false)}/>
      <h1>Destination chain</h1>
      <button className="token" onClick={() => {
        setDstChain({name: "Avalanche", logo: "https://cryptologos.cc/logos/avalanche-avax-logo.png?v=025", id: "43114"});
        setDisplayChains(false);
      }}>
        <img className="token-logo" src="https://cryptologos.cc/logos/avalanche-avax-logo.png?v=025"/>
        <p>Avalanche</p>
      </button>
      <button className="token" onClick={() => {
        setDstChain({name: "Polygon", logo: "https://cryptologos.cc/logos/polygon-matic-logo.png?v=025", id: "137"});
        setDisplayChains(false);
      }}>
        <img className="token-logo" src="https://cryptologos.cc/logos/polygon-matic-logo.png?v=025"/>
        <p>Polygon</p>
      </button>
      <button className="token" onClick={() => {
        setDstChain({name: "Arbitrum", logo: "https://cryptologos.cc/logos/arbitrum-arb-logo.png?v=025", id: "42161"});
        setDisplayChains(false);
      }}>
        <img className="token-logo" src="https://cryptologos.cc/logos/arbitrum-arb-logo.png?v=025"/>
        <p>Arbitrum</p>
      </button>
    </div>
  )
}

export function MainPage() {
  const walletAddress = useContext(WalletContext);
  const [displayPopUp, setDisplayPopUp] = useState(false);
  const [displayChains, setDisplayChains] = useState(false);
  const [dstChain, setDstChain] = useState({
    name: "Avalanche", 
    logo: "https://cryptologos.cc/logos/avalanche-avax-logo.png?v=025", 
    id: "43114"
  });
  const [token, setToken] = useState(
    SupportedBlockchainsData[dstChain.id].tokens[0]
  );
  
  return (
    <GlobalContext.Provider value={[web3]}>
      <div className="main">
        <Link className="link" to="/about">About</Link>
        <Link className="link" to="/contacts">Contacts</Link>
        <div className="wrapper">
          <button className="choose-token" onClick={() => setDisplayPopUp(true)}>
            <img className="token-logo" src={token.logo}/>
            <p>{token.name}</p>
          </button>
          {
            displayPopUp ? 
            <PopUp 
              setDisplayPopUp={setDisplayPopUp}
              setToken={setToken}
              dstChain={dstChain}
            /> : null
          }
          <button className="choose-token" onClick={() => setDisplayChains(true)}>
            <img className="token-logo" src={dstChain.logo}/>
            <p>{dstChain.name}</p>
          </button>
          {
            displayChains ? 
            <ChainsPopUp
              setDisplayChains={setDisplayChains}
              setDstChain={setDstChain}
            /> : null
          }
          <button className="swap" onClick={() => sendTransaction(web3, walletAddress, token, dstChain.id)}>
            <p>Swap</p>
          </button>
        </div>
      </div>
    </GlobalContext.Provider>
  )
}