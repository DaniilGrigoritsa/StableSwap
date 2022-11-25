import "../styles/Home.css";

export function OrdersList({handleCancelingAnOrder, openedOrders}) {

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

    if (openedOrders == []) {
        return (
            <div>
                {ordersList}
            </div>
        )
    }
    else {
        return (
            <p>You don't have any opened orders</p>
        )
    }
}