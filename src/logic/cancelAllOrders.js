import  sendTransaction  from './sendTransaction';
import {
    Web3ProviderConnector,
    LimitOrderProtocolFacade
} from '@1inch/limit-order-protocol';


const cancelAllOrders = async (
    web3, 
    walletAddress, 
    contractAddress,
) => {
    const connector = new Web3ProviderConnector(web3);

    const limitOrderProtocolFacade = new LimitOrderProtocolFacade(
        contractAddress,
        connector
    );
    
    const callData = limitOrderProtocolFacade.increaseNonce();
    
    await sendTransaction(web3, walletAddress, contractAddress, callData);
}

export default cancelAllOrders;
