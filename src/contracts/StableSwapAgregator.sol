// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

interface UniswapV2Router {
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);
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
}

contract StableSwapAgregator {
    address private OWNER;
    uint256 public SLIPPAGE;
    address private immutable uniswapV2Router;
    address public immutable stargateRouterAddress;

    constructor(
        uint256 slippage,
        address _uniswapV2Router, 
        address _stargateRouterAddress
    ) {
        OWNER = msg.sender;
        SLIPPAGE = slippage;
        uniswapV2Router = _uniswapV2Router;
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
        uint256 amount = 0;
        for(uint8 i = 0; i < datas.length; ) {
            (
                address tokenIn,
                uint256 amountOutMinimum
            ) = abi.decode(datas[i], (address, uint256));
            IERC20 token = IERC20(tokenIn);
            uint256 balance = token.balanceOf(msg.sender);
            token.transfer(address(this), balance);
            token.approve(uniswapV2Router, balance);
            address[] memory path;
            path[0] = tokenIn;
            path[1] = tokenOut;
            uint256[] memory amounts = UniswapV2Router(uniswapV2Router).swapExactTokensForTokens(
                balance, amountOutMinimum, path, to, block.timestamp
            );
            amount += amounts[1];
            unchecked { i++; }
        }
        if (bytes32(stargateSwapData) != bytes32("0x")) {
            stargateStableSwap(tokenOut, stargateSwapData);
        }
        else IERC20(tokenOut).transfer(to, amount);
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