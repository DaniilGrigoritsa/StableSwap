import  sendTransaction  from './sendTransaction';

const ABI = require("../abis/Contract.json");

const cancelAllOrders = async (
    web3, 
    walletAddress, 
    contractAddress, 
    orders
) => {
    const contract = new web3.eth.Contract(ABI, contractAddress);
    const targets = [];
    const datas = [];

    orders.map((order) => {
        const data = contract.methods.cancelOrder(order).encodeABI();
        datas.push(data);
        targets.push(order["maker"]);
    })

    const data = contract.methods.simulateCalls(targets, datas).encodeABI();

    await sendTransaction(web3, walletAddress, contractAddress, data);
}

export default cancelAllOrders;