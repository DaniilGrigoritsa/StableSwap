import Web3 from "web3";
import { useState } from "react";
import cancelOrderLogic from "../logic/cancelOrder";
import placeOrderLogic from "../logic/placeOrder";
import { OrdersList } from "./OrdrersList";


const web3 = new Web3(window.ethereum);
window.ethereum.enable(); 

const gasLimit = 6800000;
const gasPrice = 21000;
const contractAddress = "0x94Bc2a1C732BcAd7343B25af48385Fe76E08734f";
const chainId = 137;


export function OneInch({walletAddress}) {

    const [makerAmount, setMakerAmount] = useState('');
    const [takerAmount, setTakerAmount] = useState('');
    const [thresholdAmount, setThresholdAmount] = useState(0);
    const [makerAsset, setMakerAsset] = useState('');
    const [takerAsset, setTakerAsset] = useState('');

    // может быть добавлено множество различных токенов 
    const assets = {
      "DAI": "0x6B175474E89094C44Da98b954EedeAC495271d0F",
      "USDT": "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      "WETH": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      "1Inch": "0x111111111117dC0aa78b770fA6A738034120C302"
    }

    let openedOrders = [];
    
    const onChangeMakerAmount = (e) => {
        const makerAmount = e.target.value;
        setMakerAmount(makerAmount);
    };

    const onChangeTakerAmount = (e) => {
        const takerAmount = e.target.value;
        setTakerAmount(takerAmount);
    };

    const handlePlacingAnOrder = async () => {
        if (makerAsset && takerAsset && makerAmount && takerAmount) {
          const order = await placeOrderLogic(
            web3, 
            walletAddress, 
            gasLimit, 
            gasPrice, 
            contractAddress, 
            makerAmount, 
            takerAmount, 
            assets[makerAsset],
            assets[takerAsset],
            thresholdAmount, 
            chainId
          );
          openedOrders.push(order);
      }
    }

    const handleCancelingAnOrder = async (canceledOrder) => {
      await cancelOrderLogic(
        web3, 
        gasLimit, 
        gasPrice, 
        contractAddress, 
        walletAddress, 
        canceledOrder
      );
      openedOrders.remove(canceledOrder);
    }
    
    return (
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
          <button onClick={() => handlePlacingAnOrder()} className="submit">Create an order</button>
          <div className="order-list">
            <OrdersList handleCancelingAnOrder={handleCancelingAnOrder} openedOrders={openedOrders} />
          </div>
        </div>
    )
}