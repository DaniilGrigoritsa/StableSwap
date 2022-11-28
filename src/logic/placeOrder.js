import {
    LimitOrderBuilder,
    Web3ProviderConnector,
    LimitOrderProtocolFacade,
    LimitOrder,
    LimitOrderSignature
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
    const salt = Math.floor(Math.random() * 10 ** 12);
    
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
        predicate: '0x0',
        permit: '0x0',
        interaction: '0x0',
    });

    const limitOrderTypedData = limitOrderBuilder.buildLimitOrderTypedData(
        limitOrder
    );

    const signature = await limitOrderBuilder.buildOrderSignature(
        walletAddress,
        limitOrderTypedData
    );

    const limitOrderProtocolFacade = new LimitOrderProtocolFacade(contractAddress, connector);

    const order = {
        "salt": salt.toString(),
        "makerAsset": makerAssetAddress,
        "takerAsset": takerAssetAddress,
        "maker": makerAddress,
        "receiver": "0x0000000000000000000000000000000000000000",
        "allowedSender": "0x0000000000000000000000000000000000000000",
        "makingAmount": makingAmount,
        "takingAmount": takingAmount,
        "makerAssetData": "0x",
        "takerAssetData": "0x",
        "getMakerAmount": "0x",
        "getTakerAmount": "0x",
        "predicate": "0x",
        "permit": "0x",
        "interaction": "0x"
    }

    const callData = limitOrderProtocolFacade.fillLimitOrder(
        order,
        signature,
        makingAmount,
        takingAmount,
        thresholdAmount
    );
    
    const success = await sendTransaction(web3, walletAddress, contractAddress, callData);
    return success;
}

export default placeOrderLogic;