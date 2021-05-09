const { assert, web3 } = require("hardhat");
const SwapingContract = artifacts.require("SwapingContract");
const ERC20 = artifacts.require("ERC20");

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
     const transaction =  await instance.SwapMultiple([BTCTOKEN,LINKTOKEN],[50,50],5,{value:web3.utils.toWei("1")})
     assert.isOk(transaction)
    } catch (error) {
      assert.fail(error)
    }

  })

  it("Should not have any money left", async () =>{
    try {
      const transaction =  await instance.SwapMultiple([BTCTOKEN,LINKTOKEN],[25,25],5,{value:web3.utils.toWei("1")})
      // uni = new ERC20(LINKTOKEN)
      // console.log("This is the log from the test %s",await uni.balanceOf(accounts[0]))
      assert.equal(0,await web3.eth.getBalance(instance.address))
     } catch (error) {
       assert.fail(error)
     }
  })
  
  it("Swap tokens until the percentage admit then return the extra money ", async () =>{
    try {
      const transaction =  await instance.SwapMultiple([UNITOKEN,BTCTOKEN],[80,70],5,{value:web3.utils.toWei("1")})
      uni = new ERC20(UNITOKEN)
      console.log("This is the log from the test %s",await uni.balanceOf(accounts[0]))
      assert.equal(0,await web3.eth.getBalance(instance.address))
      assert.ok(transaction)
    } catch (error) {
       assert.fail(error)
     }
  })

  it("Takes fee", async () => {
    let balance = await web3.eth.getBalance(accounts[0])
    let transaction =  await instance.SwapMultiple([UNITOKEN,BTCTOKEN,LINKTOKEN],[20,25,40],5,{value:web3.utils.toWei("1"),from:accounts[1]})
    transaction =  await instance.SwapMultiple([UNITOKEN,BTCTOKEN],[50,50],5,{value:web3.utils.toWei("1"),from:accounts[1]})
    transaction =  await instance.SwapMultiple([UNITOKEN,BTCTOKEN],[80,70],5,{value:web3.utils.toWei("1"),from:accounts[1]})
    balance = parseInt(balance) + parseInt(web3.utils.toWei("0.85")) * 0.001 + parseInt(web3.utils.toWei("1"))* 0.001 + parseInt(web3.utils.toWei("0.8")) * 0.001

    assert.equal(0,await web3.eth.getBalance(instance.address))
    n = await web3.eth.getBalance(accounts[0])
    console.log(web3.utils.fromWei((Math.abs(balance - parseInt(n)).toString())))
    assert.isTrue(web3.utils.fromWei((Math.abs(balance - parseInt(n)).toString())) < 0.00000000001)
    
  })

  it("I doenst run out of gas on aprox 10", async () =>{
    try {
      const transaction =  await instance.SwapMultiple([UNITOKEN,BTCTOKEN,UNITOKEN,BTCTOKEN,BTCTOKEN,UNITOKEN,BTCTOKEN,UNITOKEN,BTCTOKEN],[10,10,10,10,10,10,10,10,10],5,{value:web3.utils.toWei("1")})
      uni = new ERC20(UNITOKEN)
      assert.equal(0,await web3.eth.getBalance(instance.address))
      assert.ok(transaction)
    } catch (error) {
       assert.fail(error)
     }
  })

});
