const { assert, web3 } = require("hardhat");

const SwapingContract = artifacts.require("SwapingContract");
const UNITOKEN = "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984"
const BNBTOKEN = "0xB8c77482e45F1F44dE1745F52C74426C631bDD52" // no direct pair
const LINKTOKEN = "0x514910771AF9Ca656af840dff83E8264EcF986CA"
const BTCTOKEN = "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599"

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
     const transaction =  await instance.swapETHtoToken(BTCTOKEN,5,{value:web3.utils.toWei("1")})
     assert.isOk(transaction)
    } catch (error) {
      assert.fail(error)
    }

  })
});
