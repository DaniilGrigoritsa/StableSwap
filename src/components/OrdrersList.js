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

    const url = `https://limit-orders.1inch.io/v2.0/137/limit-order/address/${walletAddress}?page=1&statuses=%5B1%2C2%2C3%5D`;
    
    useEffect(() => {
        const fetchData = async () => {
            let array = [];
            const _result = await fetch(url);
            const result = await _result.json();

            
            for (let iter = 0; iter < result.length; iter++) {
                let obj = result[iter];
                if (!obj.orderInvalidReason) {
                    array.push(obj);
                }
            }

            setOrdersList(array);
        }
        fetchData();
    }, [orders])

    if (ordersList.length > 0) {
        orders = ordersList.map((order) => 
            order.orderInvalidReason? null :
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

    if (orders.length > 0) {
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