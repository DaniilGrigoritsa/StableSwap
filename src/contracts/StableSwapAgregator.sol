// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

interface UniswapV3Router {
    struct ExactInputSingleParams {
        address tokenIn;
        address tokenOut;
        uint24 fee;
        address recipient;
        uint256 deadline;
        uint256 amountIn;
        uint256 amountOutMinimum;
        uint160 sqrtPriceLimitX96;
    }
    function exactInputSingle(ExactInputSingleParams calldata params)
        external
        payable
        returns (uint256 amountOut);
}

interface StargateRouter {
    struct lzTxObj {
        uint256 dstGasForCall;
        uint256 dstNativeAmount;
        bytes dstNativeAddr;
    }
    function swap(
        uint16 _dstChainId,
        uint256 _srcPoolId,
        uint256 _dstPoolId,
        address payable _refundAddress,
        uint256 _amountLD,
        uint256 _minAmountLD,
        lzTxObj memory _lzTxParams,
        bytes calldata _to,
        bytes calldata _payload
    ) external payable;
}

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

contract StableSwapAgregator {
    address private OWNER;
    uint256 public SLIPPAGE = 999;
    address private immutable uniswapV3Router;
    address public immutable stargateRouterAddress;

    constructor(address _uniswapV3Router, address _stargateRouterAddress) {
        OWNER = msg.sender;
        uniswapV3Router = _uniswapV3Router;
        stargateRouterAddress = _stargateRouterAddress;
    }

    modifier ownerRestrict {
        require(OWNER == msg.sender, "Error: caller is not an OWNER");
        _;
    }

    function stableSwapMulticall(
        address to,
        address tokenOut,
        bytes[] calldata datas, 
        bytes calldata stargateSwapData
    ) external payable {
        uint256 amountOut = 0;
        for(uint8 i = 0; i < datas.length; ) {
            (
                address tokenIn,
                uint24 fee,
                uint256 amountOutMinimum,
                uint160 sqrtPriceLimitX96
            ) = abi.decode(datas[i], (address, uint24, uint256, uint160));
            IERC20 token = IERC20(tokenIn);
            token.transfer(address(this), token.balanceOf(msg.sender));
            uint256 balance = token.balanceOf(address(this));
            token.approve(uniswapV3Router, balance);
            UniswapV3Router.ExactInputSingleParams memory params = UniswapV3Router.ExactInputSingleParams(
                tokenIn, 
                tokenOut, 
                fee,
                address(this),
                block.timestamp,
                balance,
                amountOutMinimum,
                sqrtPriceLimitX96
            );
            amountOut += UniswapV3Router(uniswapV3Router).exactInputSingle(params);
            unchecked { i++; }
        }
        if (bytes32(stargateSwapData) != bytes32("0x")) {
            stargateStableSwap(tokenOut, stargateSwapData);
        }
        else IERC20(tokenOut).transfer(to, amountOut);
    }

    function stargateStableSwap(
        address stablecoinIn,
        bytes calldata stargateSwapData
    ) internal {
        (
            uint16 chainId,
            uint256 srcPoolId,
            uint256 destPoolId,
            address payable refundAddress, 
            StargateRouter.lzTxObj memory lzTxParams, 
            bytes memory to,
            bytes memory payload
        ) = abi.decode(stargateSwapData, (uint16, uint256, uint256, address, StargateRouter.lzTxObj, bytes, bytes));
        uint256 amountIn = IERC20(stablecoinIn).balanceOf(address(this));
        uint256 amountOutMin = amountIn * SLIPPAGE / 1000;
        IERC20(stablecoinIn).approve(stargateRouterAddress, amountIn);
        StargateRouter(stargateRouterAddress).swap{value: msg.value}(
            chainId, 
            srcPoolId, 
            destPoolId, 
            refundAddress,
            amountIn, 
            amountOutMin, 
            lzTxParams, 
            to, 
            payload
        );
    }

    function changeSlippage(uint256 slippage) external ownerRestrict {
        SLIPPAGE = slippage;
    }

    function changeOwner(address owner) external ownerRestrict {
        OWNER = owner;
    }

    receive() external payable {}
}