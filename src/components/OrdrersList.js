import cancelAllOrders from "../logic/cancelAllOrders";
import "../styles/Home.css";
import { useContext } from "react";
import { WalletContext } from "../App";
import { GlobalContext } from "./OneInch";


export function OrdersList({handleCancelingAnOrder}) {

    const [web3, contractAddress, openedOrders] = useContext(GlobalContext);
    const walletAddress = useContext(WalletContext);

    let ordersList = openedOrders.map((order) =>
        <div className="order" key={order.salt}>
            <span>
                <p>Maker amount: {order.makingAmount}</p>
                <p>Taker amount: {order.takingAmount}</p>
            </span>
            <span>
                <p>Maker asset: {String(order.makerAsset).substring(0, 5)}...{String(order.makerAsset).substring(36, 40)}</p>
                <p>Taker asset: {String(order.takerAsset).substring(0, 5)}...{String(order.takerAsset).substring(36, 40)}</p>
            </span>
            <button onClick={() => handleCancelingAnOrder(order)} className="cancel">
                Cancel order
            </button>
        </div>
    )

    if (openedOrders.length > 0) {
        return (
            <div>
                {ordersList}
                <button onClick={() => cancelAllOrders(
                    web3, 
                    walletAddress, 
                    contractAddress, 
                    openedOrders
                )} className="cancel">
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