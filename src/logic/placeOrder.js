import {
    LimitOrderBuilder,
    Web3ProviderConnector,
    LimitOrderProtocolFacade,
    LimitOrderPredicateBuilder
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

    const limitOrderProtocolFacade = new LimitOrderProtocolFacade(contractAddress, connector);

    const nonce = await limitOrderProtocolFacade.nonce(contractAddress);

    const limitOrderPredicateBuilder = new LimitOrderPredicateBuilder(
        limitOrderProtocolFacade
    );

    const predicate = limitOrderPredicateBuilder.nonceEquals(walletAddress, nonce);
    
    const limitOrder = limitOrderBuilder.buildLimitOrder({
        makerAssetAddress: makerAssetAddress,
        takerAssetAddress: takerAssetAddress,
        makerAddress: makerAddress, 
        makerAmount: makingAmount,
        takerAmount: takingAmount,
        predicate: predicate,
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

        
    fetch('https://limit-orders.1inch.io/v2.0/137/limit-order', {
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
}

export default placeOrderLogic;