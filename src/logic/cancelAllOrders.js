import  sendTransaction  from './sendTransaction';
import {
    LimitOrderProtocolFacade,
    Web3ProviderConnector,
} from '@1inch/limit-order-protocol';

const ABI = require("../abis/Contract.json");

const cancelAllOrders = async (
    web3, 
    walletAddress, 
    contractAddress, 
) => {

    /*
    const contract = new web3.eth.Contract(ABI, contractAddress);
    const targets = [];
    const datas = [];

    orders.map((order) => {
        const data = contract.methods.cancelOrder(order).encodeABI();
        datas.push(data);
        targets.push(contractAddress);
    })

    const data = contract.methods.simulateCalls(targets, datas).encodeABI();
    */

    
    const connector = new Web3ProviderConnector(web3);
    const limitOrderProtocolFacade = new LimitOrderProtocolFacade(
        contractAddress,
        connector
    );

    const callData = limitOrderProtocolFacade.increaseNonce();

    await sendTransaction(web3, walletAddress, contractAddress, callData);
}

export default cancelAllOrders;
