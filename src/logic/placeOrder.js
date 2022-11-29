import {
    LimitOrderBuilder,
    Web3ProviderConnector,
    LimitOrderProtocolFacade
} from '@1inch/limit-order-protocol';


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

    const limitOrderHash = limitOrderBuilder.buildLimitOrderHash(
        limitOrderTypedData
    );

        
    const order = fetch('https://limit-orders.1inch.io/v2.0/137/limit-order', {
        method: 'POST',
            headers: {
                'content-Type': 'application/json',
            },
            body: JSON.stringify({
                "orderHash": limitOrderHash,
                "signature": signature,
                "data": limitOrder
            })
    })

    return order;
}

export default placeOrderLogic;