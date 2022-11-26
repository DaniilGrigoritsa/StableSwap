import Web3 from "web3";
import { useState, useContext, createContext } from "react";
import cancelOrderLogic from "../logic/cancelOrder";
import placeOrderLogic from "../logic/placeOrder";
import { OrdersList } from "./OrdrersList";
import sendTransaction from "../logic/sendTransaction";
import { WalletContext } from "../App";


const ERC20ABI = require("../abis/ERC20ABI.json");


const WSProvider = "wss://mainnet.infura.io/ws/v3/1ab91169b78e4abca0ea58de59de04d0";
let provider = new Web3.providers.WebsocketProvider(WSProvider);
const infura = new Web3(provider);


const web3 = new Web3(window.ethereum);
window.ethereum.enable(); 

const contractAddress = "0x94Bc2a1C732BcAd7343B25af48385Fe76E08734f"; //0x741f64d0b90F2f9Bc45f0C4b8b8d716c52F1c529
const chainId = 137; // 80001 Mumbai

export const GlobalContext = createContext();


export function OneInch() {

    const walletAddress = useContext(WalletContext);

    // может быть добавлено множество различных токенов 
    const assets = {
      "DAI": "0x6B175474E89094C44Da98b954EedeAC495271d0F",
      "USDT": "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      "WETH": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      "1Inch": "0x111111111117dC0aa78b770fA6A738034120C302"
    }

    const [makerAmount, setMakerAmount] = useState('');
    const [takerAmount, setTakerAmount] = useState('');
    const [thresholdAmount, setThresholdAmount] = useState(0);
    const [makerAsset, setMakerAsset] = useState("DAI");
    const [takerAsset, setTakerAsset] = useState("DAI");
    const [tokensApproved, setTokensApproved] = useState(false);
    const [openedOrders, setOpenedOrders] = useState([]);
    
    const onChangeMakerAmount = (e) => {
        const makerAmount = e.target.value;
        setMakerAmount(makerAmount);
    };

    const onChangeTakerAmount = (e) => {
        const takerAmount = e.target.value;
        setTakerAmount(takerAmount);
    };

    const handlePlacingAnOrder = async () => {
      if (makerAmount > 0 && takerAmount > 0 && makerAsset != takerAsset) {
        let decimals = await getTokenDecimals(assets[makerAsset]);
        const actualMakerAmount = String(makerAmount).padEnd(decimals, 0);
        decimals = await getTokenDecimals(assets[takerAsset]);
        const actualTakerAmount =String(takerAmount).padEnd(decimals, 0);

        const order = await placeOrderLogic(
          web3, 
          walletAddress,  
          contractAddress, 
          actualMakerAmount, 
          actualTakerAmount, 
          assets[makerAsset],
          assets[takerAsset],
          thresholdAmount, 
          chainId
        );
        
        const orders = openedOrders;
        orders.push(order);
        setOpenedOrders(orders);
        setTokensApproved(false);
      }
    }

    const handleCancelingAnOrder = async (canceledOrder) => {
      await cancelOrderLogic(
        web3, 
        contractAddress, 
        walletAddress, 
        canceledOrder
      );
      openedOrders.remove(canceledOrder);
    }

    const handleTokensApprove = async () => {
      const makerAssetAddress = assets[makerAsset];

      // correct amount to approve by decimals
      const decimals = await getTokenDecimals(makerAssetAddress);

      if(decimals) {
        const actualMakerAmount = String(makerAmount).padEnd(decimals, 0);
        const token = new web3.eth.Contract(ERC20ABI, makerAssetAddress);
        const data = token.methods.approve(contractAddress, actualMakerAmount).encodeABI();
        const success = await sendTransaction(web3, walletAddress, makerAssetAddress, data);
      
        if(success) setTokensApproved(true);
      }
    }

    const getTokenDecimals = async (tokenAddress) => {
      const token = new infura.eth.Contract(ERC20ABI, tokenAddress);
      let decimals;

      await token.methods.decimals().call()
        .then((result) => {
          console.log(result);
          decimals = result;
        })
        .catch((error) => {
          console.log(error)
          decimals = 0;
        })

      return decimals;
    }
    
    return (
      <GlobalContext.Provider value={[web3, contractAddress, openedOrders]}>
        <div className="main">
          <div className="wrapper">
            <div className="select">
              <select value={makerAsset} onChange={(event) => {setMakerAsset(event.target.value);}}>
                <option>DAI</option>
                <option>USDT</option>
                <option>WETH</option>
                <option>1Inch</option>
              </select>
              <select value={takerAsset} onChange={(event) => {setTakerAsset(event.target.value);}}>
                <option>DAI</option>
                <option>USDT</option>
                <option>WETH</option>
                <option>1Inch</option>
              </select>
            </div> 
            <form>
              <input 
                type='number' 
                value={makerAmount}
                onChange={onChangeMakerAmount}
                placeholder="Maker Amount"
              />
              <input 
                type='number' 
                value={takerAmount}
                onChange={onChangeTakerAmount}
                placeholder="Taker Amount"
              />
            </form>
          </div>
          {tokensApproved?
            <button onClick={() => handlePlacingAnOrder()} className="submit">Create an order</button>
            :
            <button onClick={() => handleTokensApprove()} className="submit">Approve {makerAsset}</button>
          }
          <div className="order-list">
            <OrdersList handleCancelingAnOrder={handleCancelingAnOrder} setOpenedOrders={setOpenedOrders} />
          </div>
        </div>
      </GlobalContext.Provider>
    )
}