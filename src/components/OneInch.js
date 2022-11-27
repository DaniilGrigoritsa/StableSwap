import Web3 from "web3";
import { useState, useContext, createContext } from "react";
import cancelOrderLogic from "../logic/cancelOrder";
import placeOrderLogic from "../logic/placeOrder";
import { OrdersList } from "./OrdrersList";
import sendTransaction from "../logic/sendTransaction";
import { WalletContext } from "../App";
import remove from "../scripts/removeItem";


const ERC20ABI = require("../abis/ERC20ABI.json");

const web3 = new Web3(window.ethereum);
window.ethereum.enable(); 

const contractAddress = "0x94Bc2a1C732BcAd7343B25af48385Fe76E08734f";
const chainId = 137; // 80001 Mumbai

export const GlobalContext = createContext();


export function OneInch() {

    const walletAddress = useContext(WalletContext);

    // может быть добавлено множество различных токенов 
    const assets = {
      "DAI": "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063", 
      "USDT": "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
      "WETH": "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619", 
      "1Inch": "0x9c2C5fd7b07E95EE044DDeba0E97a665F142394f",
      "MATIC": "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0"
    }

    const [makerAmount, setMakerAmount] = useState('');
    const [takerAmount, setTakerAmount] = useState('');
    const [thresholdAmount, setThresholdAmount] = useState(0);
    const [makerAsset, setMakerAsset] = useState("DAI");
    const [takerAsset, setTakerAsset] = useState("DAI");
    const [tokensApproved, setTokensApproved] = useState(false);
    const [openedOrders, setOpenedOrders] = useState([]);

    console.log(tokensApproved)
    
    const onChangeMakerAmount = (e) => {
        const makerAmount = e.target.value;
        setMakerAmount(makerAmount);
    };

    const onChangeTakerAmount = (e) => {
        const takerAmount = e.target.value;
        setTakerAmount(takerAmount);
    };

    const handlePlacingAnOrder = async () => {
      if (makerAmount > 0 && takerAmount > 0 && makerAsset !== takerAsset) {
        let decimals = await getTokenDecimals(assets[makerAsset]);
        const actualMakerAmount = String(makerAmount*10**decimals)
        decimals = await getTokenDecimals(assets[takerAsset]);
        const actualTakerAmount = String(takerAmount*10**decimals);

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
        walletAddress, 
        contractAddress, 
        canceledOrder
      );
      const orders = remove(openedOrders, canceledOrder);
      setOpenedOrders(orders);
    }

    const handleTokensApprove = async () => {
      const makerAssetAddress = assets[makerAsset];

      // correct amount to approve by decimals
      const decimals = await getTokenDecimals(makerAssetAddress);

      if(decimals) {
        const actualMakerAmount = String(makerAmount*10**decimals);
        const token = new web3.eth.Contract(ERC20ABI, makerAssetAddress);
        const data = token.methods.approve(contractAddress, actualMakerAmount).encodeABI();
        const success = await sendTransaction(web3, walletAddress, makerAssetAddress, data);
      
        if(success) setTokensApproved(true);
      }
    }

    const getTokenDecimals = async (tokenAddress) => {
      const token = new web3.eth.Contract(ERC20ABI, tokenAddress);
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