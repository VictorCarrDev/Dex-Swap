// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

interface WETH is IERC20Upgradeable {
    function deposit() external payable;
    function withdraw(uint256) external;
}

interface TokenInterface is IERC20Upgradeable {
    function name() external returns(string memory);
}

interface Balancer {
    struct Swap {
        address pool;
        address tokenIn;
        address tokenOut;
        uint256 swapAmount; // tokenInAmount / tokenOutAmount
        uint256 limitReturnAmount; // minAmountOut / maxAmountIn
        uint256 maxPrice;
    }

    function viewSplitExactIn(
        address tokenIn,
        address tokenOut,
        uint256 swapAmount,
        uint256 nPools
    ) external view returns (Swap[] memory swaps, uint256 totalOutput);

    function batchSwapExactIn(
        Swap[] memory swaps,
        TokenInterface tokenIn,
        TokenInterface tokenOut,
        uint256 totalAmountIn,
        uint256 minTotalAmountOut
    ) external payable returns (uint256 totalAmountOut);
}


interface IUniswapV2Factory {
    event PairCreated(
        address indexed token0,
        address indexed token1,
        address pair,
        uint256
    );

    function getPair(address tokenA, address tokenB)
        external
        view
        returns (address pair);

    function allPairs(uint256) external view returns (address pair);

    function allPairsLength() external view returns (uint256);

    function feeTo() external view returns (address);

    function feeToSetter() external view returns (address);

    function createPair(address tokenA, address tokenB)
        external
        returns (address pair);
}

interface IUniswapV2Router01 {
    function factory() external pure returns (address);
    function addLiquidity(
        address tokenA,
        address tokenB,
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline
    )
        external
        returns (
            uint256 amountA,
            uint256 amountB,
            uint256 liquidity
        );

    function addLiquidityETH(
        address token,
        uint256 amountTokenDesired,
        uint256 amountTokenMin,
        uint256 amountETHMin,
        address to,
        uint256 deadline
    )
        external
        payable
        returns (
            uint256 amountToken,
            uint256 amountETH,
            uint256 liquidity
        );

    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint256 liquidity,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline
    ) external returns (uint256 amountA, uint256 amountB);

    function removeLiquidityETH(
        address token,
        uint256 liquidity,
        uint256 amountTokenMin,
        uint256 amountETHMin,
        address to,
        uint256 deadline
    ) external returns (uint256 amountToken, uint256 amountETH);

    function removeLiquidityWithPermit(
        address tokenA,
        address tokenB,
        uint256 liquidity,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline,
        bool approveMax,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external returns (uint256 amountA, uint256 amountB);

    function removeLiquidityETHWithPermit(
        address token,
        uint256 liquidity,
        uint256 amountTokenMin,
        uint256 amountETHMin,
        address to,
        uint256 deadline,
        bool approveMax,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external returns (uint256 amountToken, uint256 amountETH);

    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts);

    function swapTokensForExactTokens(
        uint256 amountOut,
        uint256 amountInMax,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts);

    function swapExactETHForTokens(
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external payable returns (uint256[] memory amounts);

    function swapTokensForExactETH(
        uint256 amountOut,
        uint256 amountInMax,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts);

    function swapExactTokensForETH(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts);

    function swapETHForExactTokens(
        uint256 amountOut,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external payable returns (uint256[] memory amounts);

    function quote(
        uint256 amountA,
        uint256 reserveA,
        uint256 reserveB
    ) external pure returns (uint256 amountB);

    function getAmountOut(
        uint256 amountIn,
        uint256 reserveIn,
        uint256 reserveOut
    ) external pure returns (uint256 amountOut);

    function getAmountIn(
        uint256 amountOut,
        uint256 reserveIn,
        uint256 reserveOut
    ) external pure returns (uint256 amountIn);

    function getAmountsOut(uint256 amountIn, address[] calldata path)
        external
        view
        returns (uint256[] memory amounts);

    function getAmountsIn(uint256 amountOut, address[] calldata path)
        external
        view
        returns (uint256[] memory amounts);
}

interface IUniswapV2Router02 is IUniswapV2Router01 {
    function removeLiquidityETHSupportingFeeOnTransferTokens(
        address token,
        uint256 liquidity,
        uint256 amountTokenMin,
        uint256 amountETHMin,
        address to,
        uint256 deadline
    ) external returns (uint256 amountETH);

    function removeLiquidityETHWithPermitSupportingFeeOnTransferTokens(
        address token,
        uint256 liquidity,
        uint256 amountTokenMin,
        uint256 amountETHMin,
        address to,
        uint256 deadline,
        bool approveMax,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external returns (uint256 amountETH);

    function swapExactTokensForTokensSupportingFeeOnTransferTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external;

    function swapExactETHForTokensSupportingFeeOnTransferTokens(
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external payable;

    function swapExactTokensForETHSupportingFeeOnTransferTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external;
}
// 0x5FC8d32690cc91D4c39d9d3abcBD16989F875707


contract SwapingContractV2 is Initializable{
    
    IUniswapV2Factory uniFact;
    address payable owner;
    
    function initialize() public initializer {
                uniFact = IUniswapV2Factory(IUniswapV2Router02(0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D).factory());
                owner = payable(msg.sender);
                }

    function swapETHtoToken(
        address _addressToSwap,
        uint256 amountSent,
        uint256 _slippage
    ) internal {
        require(
            address(0) != uniFact.getPair(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2, _addressToSwap),
            "Non Existant Pair For transaction"
        );
        require(_slippage < 100, "slippage cannot be more than 100%");
        address[] memory _path = get_path(_addressToSwap);
        uint256 _number = IUniswapV2Router02(0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D).getAmountsOut(amountSent, _path)[1];

        _number = (_number * (100 - _slippage)) / 100;

        IUniswapV2Router02(0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D).swapExactETHForTokens{value: amountSent}(
            _number,
            _path,
            msg.sender,
            block.timestamp + 15
        );

    }

        function get_path(address _address)
        internal
        pure
        returns (address[] memory)
    {
        address[] memory _path = new address[](2);
        _path[0] = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
        _path[1] = _address;
        return _path;
    }

    function _wrapEth(uint _value) private {
        WETH(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2).deposit{value: _value}();

        if (WETH(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2).allowance(address(this), 0x3E66B66Fd1d0b02fDa6C811Da9E0547970DB2f21) < _value) {
            WETH(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2).approve(0x3E66B66Fd1d0b02fDa6C811Da9E0547970DB2f21, _value);
        }
    }

    function DOit(address _tokenAddress,uint _value, uint _slippage) internal {
        require(_slippage < 100, "slippage cannot be more than 100%");
        _wrapEth(_value);
        (Balancer.Swap[] memory swaps, uint256 totalOutput) =
            Balancer(0x3E66B66Fd1d0b02fDa6C811Da9E0547970DB2f21).viewSplitExactIn(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2, _tokenAddress, _value, 2);
        totalOutput = Balancer(0x3E66B66Fd1d0b02fDa6C811Da9E0547970DB2f21).batchSwapExactIn(
            swaps,
            TokenInterface(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2),
            TokenInterface(_tokenAddress),
            _value,
            totalOutput * (100 - _slippage) / 100
        );
        TokenInterface(_tokenAddress).transfer(msg.sender,totalOutput);
    }

        function SwapMultipleV2(
        address[] memory _addressesToSwap,
        uint256[] memory _distribution,
        uint8[] memory _wichOne,
        uint256 _slipp
    ) external payable {
        require(_addressesToSwap.length == _distribution.length, "array size doesnt match");
         uint _max = 100;
         bool _continue = true;
        for (uint256 index = 0; index < _addressesToSwap.length; index++) {
            unchecked {
            _distribution[index] > _max ? (_continue = false, _max = _max) : (_continue = true , _max = _max - _distribution[index]);
            }   
            if (!_continue) {
                break;
            }
            uint _num =  (_distribution[index] * msg.value) / 100;
            uint _fee = _num * 1 /1000;
            _num -= _fee;
            owner.transfer(_fee);
            if (_wichOne[index] == 0){
            swapETHtoToken(
                _addressesToSwap[index],
               _num,
                _slipp
            );}
            else{
            DOit(
                _addressesToSwap[index],
               _num,
                _slipp
            );
            }
        }
        payable(msg.sender).transfer(msg.value * _max / 100);
    }
}
