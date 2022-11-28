import cancelAllOrders from "../logic/cancelAllOrders";
import "../styles/Home.css";
import { useContext, useEffect, useState } from "react";
import { WalletContext } from "../App";
import { GlobalContext } from "./OneInch";


export function OrdersList({handleCancelingAnOrder}) {

    const [ordersList, setOrdersList] = useState([]);

    const [web3, contractAddress] = useContext(GlobalContext);
    const walletAddress = useContext(WalletContext);
    let orders = [];

    //const walletAddress1 = "0xbD9dff9A86fda1230D1C44fFf811791BAd16B48a";

    const url = `https://limit-orders.1inch.io/v2.0/137/limit-order/address/${walletAddress}?page=1&statuses=%5B1%2C2%2C3%5D`;
    
    useEffect(() => {
        const fetchData = async () => {
            const result = await fetch(url);
            setOrdersList(await result.json());
        }
        fetchData();
    }, [])

    if (ordersList.length > 0) {
        orders = ordersList.map((order) =>
            <div className="order" key={order.data.salt}>
                <span>
                    <p>Maker amount: {order.data.makingAmount}</p>
                    <p>Taker amount: {order.data.takingAmount}</p>
                </span>
                <span>
                    <p>Maker asset: {(order.data.makerAsset).substring(0, 5)}...{(order.data.makerAsset).substring(36, 40)}</p>
                    <p>Taker asset: {(order.data.takerAsset).substring(0, 5)}...{(order.data.takerAsset).substring(36, 40)}</p>
                </span>
                <button onClick={() => handleCancelingAnOrder(order.data)} className="cancel">
                    Cancel order
                </button>
            </div>
        )
    }

    if (ordersList.length > 0) {
        return (
            <div>
                {orders}
                <button onClick={() => 
                    cancelAllOrders(
                        web3, 
                        walletAddress, 
                        contractAddress
                    )            
                } className="cancel">
                    Cancel all orders
                </button>
            </div>
        )   
    }
    else {
        return (
            <p>You don't have any opened orders</p>
        )
    }
}