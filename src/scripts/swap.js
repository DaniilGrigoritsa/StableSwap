// import * as dotenv from "dotenv";
import axios from "axios";
import SupportedBlockchainsData from "./networks.js";
import StargateRouterAbi from "../interfaces/StargateRouter.json";

// dotenv.config();

const API_KEY = "XT4GTWMD4Y9YI9ISXQSFH2J697IMRHW253";
const ERC20ADDR = "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9";
const BYTES_ZERO = "0x0000000000000000000000000000000000000000000000000000000000000000";

const getGasPrice = async (web3) => {
    return await web3.eth.getGasPrice();
}

const getToken = (_chainId, stablecoinSwapTo) => {
    for (let token of SupportedBlockchainsData[_chainId].tokens) {
        if (token.name === stablecoinSwapTo) return token;
    }
}

const getBalance = async (web3, wallet, token) => {
    const ABI = `https://api.arbiscan.io/api?module=contract&action=getabi&address=${ERC20ADDR}&apikey=${API_KEY}`;
    const abi = await axios.get(ABI);
    const contract = await new web3.eth.Contract(
        JSON.parse(abi.data.result),
        token
    )
    const balance = await contract.methods.balanceOf(wallet).call();
    return balance;
}

const getTokensSwapFrom = async (wallet, tokenOut, chainId) => {
    const url = `https://api.debank.com/token/balance_list?user_addr=${wallet}&chain=${chainId}`;
    const response = await axios.get(url);
    console.log(response)
    const tokenAddresses = [];
    response.data.data.map((tokenAddress) => {
        if (tokenAddress.id.length == "42" && tokenAddress.id != tokenOut) {
            tokenAddresses.push(tokenAddress.id);
        }
    });
    console.log("Token addresses: ", tokenAddresses)
    return tokenAddresses;
}

const estimateGasFees = async (web3, wallet, dstChainId) => {
    const stargateRouter = await new web3.eth.Contract(
        StargateRouterAbi, 
        SupportedBlockchainsData[dstChainId].StargateRouter
    )
    const functionType = 1;
    const fees = await stargateRouter.methods.quoteLayerZeroFee(
        SupportedBlockchainsData[dstChainId].chainId,
        functionType,
        wallet,
        BYTES_ZERO,
        [0, 0, "0x0000000000000000000000000000000000000001"]
    ).call();
    return fees[0];
} 

const encodeSwapCall = async (
    wallet,
    web3,
    tokensSwapFrom,
    stablecoinSwapTo,
    srcChainId,
    dstChainId
) => {
    console.log("Stable coin swap to", stablecoinSwapTo)
    const datas = [];
    for(let token of tokensSwapFrom) {
        // Encode SushiSwap V2 Swap Call
        let data = web3.eth.abi.encodeParameters(
            ["address","uint256"],
            [token, 0,]
        )
        datas.push(data);
    }
    let stargateData;
    if (dstChainId == srcChainId) stargateData = BYTES_ZERO;
    else {
        const scrToken = getToken(srcChainId, stablecoinSwapTo.name);
        const dstToken = getToken(dstChainId, stablecoinSwapTo.name);
        stargateData = web3.eth.abi.encodeParameters(
            ["uint16","uint256","uint256","address",[["uint256","uint256","bytes"]],"bytes","bytes"],
            [
                SupportedBlockchainsData[dstChainId].chainId,
                scrToken.poolId,
                dstToken.poolId,
                wallet,
                [0, 0, "0x0000000000000000000000000000000000000001"],
                wallet,
                BYTES_ZERO
            ]
        )
    }
    const calldata = {
        tokenOut: stablecoinSwapTo.address,
        datas: datas,
        stargateSwapData: stargateData
    }
    return calldata;
}

export const sendTransaction = async (
    web3, 
    wallet,
    stableCoinSwapTo,
    dstChainId
) => {
    // May be choosed by user from UI, now hardcoded 
    const slippage = 5;
    const chainId = web3.utils.hexToNumber(window.ethereum.chainId);
    const tokensSwapFrom = await getTokensSwapFrom(
        wallet, 
        stableCoinSwapTo.address,
        SupportedBlockchainsData[chainId].chainName
    );
    const data = await encodeSwapCall(
        wallet, 
        web3, 
        tokensSwapFrom, 
        stableCoinSwapTo,
        chainId,
        dstChainId
    );
    const calldata = await web3.eth.abi.encodeFunctionCall({
        "inputs": [
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "slippage",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "tokenOut",
				"type": "address"
			},
			{
				"internalType": "bytes[]",
				"name": "datas",
				"type": "bytes[]"
			},
			{
				"internalType": "bytes",
				"name": "stargateSwapData",
				"type": "bytes"
			}
		],
		"name": "stableSwapMulticall",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
    }, [wallet, slippage, data.tokenOut, data.datas, data.stargateSwapData]);
    const gasPrice = await getGasPrice(web3);
    console.log(calldata)
    /*
    const transaction = {
        'from': wallet,
        'to': SupportedBlockchainsData[chainId].StableSwap,
        'value': chainId == dstChainId ? "0" : await estimateGasFees(web3, wallet, dstChainId),
        'gasLimit': "0x0100000", // ????
        'gasPrice': web3.utils.toWei(gasPrice, 'gwei'),
        'data': calldata
    }
    await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [transaction],
    }).then((result) => {console.log(result)}).catch((error) => {console.log(error)}); 
    */
}

export default sendTransaction;
