import Web3 from "web3";
import { useState, useContext, createContext, useEffect } from "react";
import { WalletContext } from "../App";
import { Link } from "react-router-dom";
import SupportedBlockchainsData from "../scripts/networks";
import utils from "../scripts/swap";
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
  const chains = [];
  Object.keys(SupportedBlockchainsData).forEach((key, index) => {
    chains.push(
      <div key={SupportedBlockchainsData[key].fullname}>
        <button className="token" onClick={() => {
          setDstChain({
            name: SupportedBlockchainsData[key].fullname, 
            logo: SupportedBlockchainsData[key].logo, 
            id: key
          });
          setDisplayChains(false);
        }}>
          <img className="token-logo" src={SupportedBlockchainsData[key].logo}/>
          <p>{SupportedBlockchainsData[key].fullname}</p>
        </button>
      </div>
    )
  })
  return (
    <div className="pop-up">
      <img className="close" src={cross} alt="close" onClick={() => setDisplayChains(false)}/>
      <h1>Destination chain</h1>
      {chains}
    </div>
  )
}

const operateStableSwap = async (
  walletAddress,
  token,
  dstChainId,
  slippage
) => {
  const data = await utils.createCalldata( 
    web3, 
    walletAddress,
    token,
    dstChainId,
    slippage
  );
  await utils.sendTransaction(web3, walletAddress, dstChainId, data);
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
  const [calldata, setCalldata] = useState("0x");
  // Choosed by user, now hardcoded
  const [slippage, setSlippage] = useState(5);
  const [tokenList, setTokenList] = useState([]);
  const [totalBalanseUSD, setTotalBalance] = useState(0);
  const [chainId, setChainId] = useState();

  useEffect(() => {
    setChainId(window.ethereum.chainId);
  }, [])

  useEffect(() => {
    const getBalance = async () => {
      const balance = await utils.getTotalWalletBalanceInUSD(
        web3,
        walletAddress
      );
      setTotalBalance(balance);
      console.log("Total balance: ", totalBalanseUSD);
    }
    const _chainId = window.ethereum.chainId;
    console.log("Chain id: ", _chainId)
    if (_chainId != chainId) {
      setChainId(_chainId);
      getBalance();
    }
  });
  
  return (
    <GlobalContext.Provider value={[web3]}>
      <div className="main">
        <Link className="link" to="/about">About</Link>
        <Link className="link" to="/contacts">Contacts</Link>
        <p>Total balance: {totalBalanseUSD}</p>
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
          <button 
            className="swap" 
            onClick={() => operateStableSwap( 
              walletAddress, 
              token, 
              dstChain.id,
              slippage
            )}
          >
            <p>Swap</p>
          </button>
        </div>
      </div>
    </GlobalContext.Provider>
  )
}