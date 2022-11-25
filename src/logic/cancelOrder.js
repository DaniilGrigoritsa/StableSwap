const ABI = require("../abis/Contract.json");


const cancelOrderLogic = async (web3, walletAddress, gasLimit, gasPrice, contractAddress, canceledOrder) => {
    const contract = new web3.eth.Contract(ABI, contractAddress);
    const data = contract.methods.cancelOrder(canceledOrder).encodeABI();
    const nonce = await web3.eth.getTransactionCount(walletAddress, 'latest');
    
    const transaction = {
        'from': walletAddress,
        'to': contractAddress,
        'value': "0x00",
        'gasLimit': gasLimit.toString(), 
        'gasPrice': gasPrice.toString(),  
        'nonce': nonce.toString(),
        'data': data
    };
    
    await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [transaction],
    }).then((result) => {console.log(result)}).catch((error) => {console.log(error)});
}

export default cancelOrderLogic;