// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "hardhat/console.sol";

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

// 0x5FC8d32690cc91D4c39d9d3abcBD16989F875707

contract SwapingBalancer {
    Balancer bal = Balancer(0x3E66B66Fd1d0b02fDa6C811Da9E0547970DB2f21);
    WETH weth = WETH(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2);
    address payable owner;

    constructor() {
        owner = payable(msg.sender);
    }

    function _wrapEth(uint _value) private {
        weth.deposit{value: _value}();

        if (weth.allowance(address(this), address(bal)) < _value) {
            weth.approve(address(bal), _value);
        }
    }

    function DOit(address _tokenAddress,uint _value, uint _slippage) internal {
        require(_slippage < 100, "slippage cannot be more than 100%");
        _wrapEth(_value);
        console.log("token name %s", TokenInterface(_tokenAddress).name());
        (Balancer.Swap[] memory swaps, uint256 totalOutput) =
            bal.viewSplitExactIn(address(weth), _tokenAddress, _value, 2);
            console.log(totalOutput);
        console.log("im still standing");
        totalOutput = bal.batchSwapExactIn(
            swaps,
            TokenInterface(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2),
            TokenInterface(_tokenAddress),
            _value,
            totalOutput * (100 - _slippage) / 100
        );
        TokenInterface(_tokenAddress).transfer(msg.sender,totalOutput);
        console.log("output recieved %s",totalOutput);
        console.log("balance of      %s",TokenInterface(_tokenAddress).balanceOf(msg.sender));
    }

        function SwapMultiple(
        address[] memory _addressesToSwap,
        uint256[] memory _distribution,
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
            // console.log(_num);
            // console.log(_fee);
            owner.transfer(_fee);
            DOit(
                _addressesToSwap[index],
               _num,
                _slipp
            );
        }
        // console.log(_max);
        payable(msg.sender).transfer(msg.value * _max / 100);
    }
}
