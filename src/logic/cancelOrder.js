import sendTransaction from './sendTransaction';

const ABI = require("../abis/Contract.json");


const cancelOrderLogic = async (
    web3, 
    walletAddress, 
    contractAddress, 
    canceledOrder
) => {
    const contract = new web3.eth.Contract(ABI, contractAddress);
    const data = contract.methods.cancelOrder(canceledOrder).encodeABI();
    
    await sendTransaction(web3, walletAddress, contractAddress, data);
}

export default cancelOrderLogic;