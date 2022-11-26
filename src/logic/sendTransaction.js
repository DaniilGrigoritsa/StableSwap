const sendTransaction = async (web3, from, to, data) => {
    const success = true;
    const nonce = await web3.eth.getTransactionCount(from, 'latest');

    const transaction = {
        from: from,
        to: to,
        value: "0x00",  
        gas: "500000",
        nonce: nonce.toString(),
        data: data
    };

    
    await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [transaction],
      }).then((result) => {
        console.log(result);
        return success;
      }).catch((error) => {
        console.log(error)
        return !success;
    });
}

export default sendTransaction;