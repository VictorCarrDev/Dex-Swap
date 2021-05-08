const { assert, web3 } = require("hardhat");

const SwapingContract = artifacts.require("SwapingContract");
const UNITOKEN = "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984"

// Traditional Truffle test
contract("The swaping contract bb", accounts => {
let instance

beforeEach(async () => {instance = await SwapingContract.new()})

  it("Should not explode ", async function() {
    const greeter = await SwapingContract.new();
    assert.ok(greeter.address);
  });

  it("should trade Ether", async () => {
    try {
     const transaction =  await instance.swapETHtoToken(UNITOKEN,{value:web3.utils.toWei("1")})
     assert.isOk(transaction)
    } catch (error) {
      assert.fail(error)
    }

  })
});
