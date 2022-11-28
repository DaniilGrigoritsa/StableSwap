import {
    LimitOrderProtocolFacade,
    LimitOrder,
    Web3ProviderConnector
} from '@1inch/limit-order-protocol';
import sendTransaction from './sendTransaction';


const cancelOrderLogic = async (
    web3, 
    walletAddress, 
    contractAddress, 
    canceledOrder
) => {
    const connector = new Web3ProviderConnector(web3);
    const limitOrderProtocolFacade = new LimitOrderProtocolFacade(contractAddress, connector);
    const callData = limitOrderProtocolFacade.cancelLimitOrder(canceledOrder);

    await sendTransaction(web3, walletAddress, contractAddress, callData);
}

export default cancelOrderLogic;