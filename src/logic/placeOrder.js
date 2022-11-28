import {
    LimitOrderBuilder,
    Web3ProviderConnector,
    LimitOrderProtocolFacade
} from '@1inch/limit-order-protocol';
import sendTransaction from './sendTransaction';


const placeOrderLogic = async (
    web3, 
    walletAddress, 
    contractAddress, 
    makingAmount, 
    takingAmount, 
    makerAssetAddress, 
    takerAssetAddress, 
    thresholdAmount, 
    chainId
) => {
    
    const makerAddress = web3.utils.toChecksumAddress(walletAddress);
    const connector = new Web3ProviderConnector(web3);
    
    const limitOrderBuilder = new LimitOrderBuilder(
        contractAddress,
        chainId,
        connector
    );
    
    const limitOrder = limitOrderBuilder.buildLimitOrder({
        makerAssetAddress: makerAssetAddress,
        takerAssetAddress: takerAssetAddress,
        makerAddress: makerAddress, 
        makerAmount: makingAmount,
        takerAmount: takingAmount,
        predicate: '0x',
        permit: '0x',
        interaction: '0x',
    });

    const limitOrderTypedData = limitOrderBuilder.buildLimitOrderTypedData(
        limitOrder
    );

    const signature = await limitOrderBuilder.buildOrderSignature(
        walletAddress,
        limitOrderTypedData
    );

    console.log(signature)
    console.log(limitOrder.salt)
    console.log("Maker data", limitOrder.getMakerAmount)
    console.log("Taker data", limitOrder.getTakerAmount)

    const limitOrderProtocolFacade = new LimitOrderProtocolFacade(contractAddress, connector);

    console.log("makingAmount:", makingAmount);
    console.log("takingAmount:", takingAmount);

    takingAmount = "0";

    console.log("thresholdAmount", thresholdAmount)

    const callData = limitOrderProtocolFacade.fillLimitOrder(
        limitOrder,
        signature,
        makingAmount,
        takingAmount, 
        thresholdAmount 
    );

    console.log("calldata", callData)
    
    const success = await sendTransaction(web3, walletAddress, contractAddress, callData);
    return success;
}

export default placeOrderLogic;