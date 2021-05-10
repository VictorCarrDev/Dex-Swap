const { assert, web3 } = require("hardhat");
const axios = require('axios');

const swapingContract = artifacts.require("SwapingContract");
const swapingContractV2 = artifacts.require("SwapingContractV2");
const ERC20 = artifacts.require("contracts/BalancerVersion.sol:TokenInterface");

const UNITOKEN = "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984"
const BNBTOKEN = "0xB8c77482e45F1F44dE1745F52C74426C631bDD52" // no direct pair
const LINKTOKEN = "0x514910771AF9Ca656af840dff83E8264EcF986CA"
const BTCTOKEN = "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599"
const DAITOKEN = "0x6B175474E89094C44Da98b954EedeAC495271d0F"

async function bestSeller(token_array, ether){
  let bestDealArray = []
  for (const address in token_array) {
    if (Object.hasOwnProperty.call(token_array, address)) {
      const token = token_array[address];
      
      response = await axios.get("https://api.1inch.exchange/v3.0/1/quote",
      {
        params:{
          fromTokenAddress:"0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
          toTokenAddress:token,
          amount:web3.utils.toWei(ether),
          protocols:"UNISWAP_V2,BALANCER"
        }
      })
      bestDealArray.push(response.data.protocols[0][0][0].name == "UNISWAP_V2" ? 0 : 1)
    }
  }
  return bestDealArray
}

// Traditional Truffle test
contract("Version 1 of the contract", accounts => {
let instance

beforeEach(async () => {   
    const SwapingContract = await ethers.getContractFactory("SwapingContract");
    const etherInstance = await upgrades.deployProxy(SwapingContract);
    instance = await swapingContract.at(etherInstance.address)
  
  })

  it("Should not explode ", async function() {
    const SwapingContract = await ethers.getContractFactory("SwapingContract");
    const instance = await upgrades.deployProxy(SwapingContract);
    assert.ok(instance.address);
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
      assert.equal(0,await web3.eth.getBalance(instance.address))
      assert.ok(transaction)
    } catch (error) {
       assert.fail(error)
     }
  })

  it("Takes fee", async () => {
    let balance = await web3.eth.getBalance(accounts[0])
    let transaction =  await instance.SwapMultiple([UNITOKEN,BTCTOKEN,LINKTOKEN],[20,25,40],5,{value:web3.utils.toWei("1"),from:accounts[1]})
    console.log("gas used in here was %s",transaction.receipt.gasUsed)
    transaction =  await instance.SwapMultiple([UNITOKEN,BTCTOKEN],[50,50],5,{value:web3.utils.toWei("1"),from:accounts[1]})
    transaction =  await instance.SwapMultiple([UNITOKEN,BTCTOKEN],[80,70],5,{value:web3.utils.toWei("1"),from:accounts[1]})
    balance = parseInt(balance) + parseInt(web3.utils.toWei("0.85")) * 0.001 + parseInt(web3.utils.toWei("1"))* 0.001 + parseInt(web3.utils.toWei("0.8")) * 0.001

    assert.equal(0,await web3.eth.getBalance(instance.address))
    n = await web3.eth.getBalance(accounts[0])
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


contract("Version 2 of the contract", accounts => {
let instance

beforeEach(async () => {   
    const SwapingContract = await ethers.getContractFactory("SwapingContract");
    const SwapingContractV2 = await ethers.getContractFactory("SwapingContractV2");

    const etherInstance = await upgrades.deployProxy(SwapingContract);
    const upgraded = await upgrades.upgradeProxy(etherInstance.address, SwapingContractV2);

    instance = await swapingContractV2.at(upgraded.address)
    // SwapingContractV2
  })

  it("Should not explode ", async function() {
    const SwapingContract = await ethers.getContractFactory("SwapingContract");
    const SwapingContractV2 = await ethers.getContractFactory("SwapingContractV2");

    const etherInstance = await upgrades.deployProxy(SwapingContract);
    const upgrade = await upgrades.upgradeProxy(etherInstance.address, SwapingContractV2);

    assert.ok(upgrade.address);
    assert.equal(etherInstance.address, upgrade.address)
  });

  it("should trade Ether", async () => {
    try {
      let ammount = "1"
      let token_list = [BTCTOKEN,LINKTOKEN]
      let seller = await bestSeller(token_list,ammount)
     const transaction =  await instance.SwapMultipleV2(token_list,[50,50],seller,5,{value:web3.utils.toWei(ammount)})
     assert.isOk(transaction)
    } catch (error) {
      assert.fail(error)
    }

  })

  it("Should not have any money left", async () =>{
    try {
      let ammount = "1"
      let token_list = [DAITOKEN,LINKTOKEN]
      let seller = await bestSeller(token_list,ammount)
      const transaction =  await instance.SwapMultipleV2(token_list,[25,25],seller,5,{value:web3.utils.toWei(ammount)})

      assert.equal(0,await web3.eth.getBalance(instance.address))
     } catch (error) {
       assert.fail(error)
     }
  })
  
  it("Swap tokens until the percentage admit then return the extra money ", async () =>{
    try {
      let ammount = "1"
      let token_list = [UNITOKEN,DAITOKEN]
      let seller = await bestSeller(token_list,ammount)
      const transaction =  await instance.SwapMultipleV2(token_list,[80,70],seller,5,{value:web3.utils.toWei(ammount)})
      uni = new ERC20(UNITOKEN)
      assert.equal(0,await web3.eth.getBalance(instance.address))
      assert.ok(transaction)
    } catch (error) {
       assert.fail(error)
     }
  })

  it("Takes fee", async () => {
    try{
      let balance = await web3.eth.getBalance(accounts[0])
      let ammount = "1"
      let token_list =[UNITOKEN,DAITOKEN,LINKTOKEN]
      let seller =await bestSeller(token_list,ammount)
      let transaction =  await instance.SwapMultipleV2(token_list,[20,25,40],seller,5,{value:web3.utils.toWei(ammount),from:accounts[1]})
      token_list =[UNITOKEN,DAITOKEN]
      seller = await bestSeller(token_list,ammount)
      transaction =  await instance.SwapMultipleV2(token_list,[50,50],seller,5,{value:web3.utils.toWei(ammount),from:accounts[1]})
      transaction =  await instance.SwapMultipleV2(token_list,[80,70],seller,5,{value:web3.utils.toWei(ammount),from:accounts[1]})
      balance = parseInt(balance) + parseInt(web3.utils.toWei("0.85")) * 0.001 + parseInt(web3.utils.toWei("1"))* 0.001 + parseInt(web3.utils.toWei("0.8")) * 0.001
      
      assert.equal(0,await web3.eth.getBalance(instance.address))
      n = await web3.eth.getBalance(accounts[0])
      assert.isTrue(web3.utils.fromWei((Math.abs(balance - parseInt(n)).toString())) < 0.00000000001)
    }
    catch(error){
      assert.fail(error)
    }
    
  })

  it("I doenst run out of gas on aprox 10", async () =>{
    try {
      let ammount = "1"
      let token_list =[UNITOKEN,DAITOKEN,UNITOKEN,DAITOKEN,DAITOKEN,UNITOKEN,DAITOKEN,UNITOKEN,DAITOKEN]
      let seller = await bestSeller(token_list,ammount)
      const transaction =  await instance.SwapMultipleV2(token_list,[10,10,10,10,10,10,10,10,10],seller,5,{value:web3.utils.toWei(ammount)})
      uni = new ERC20(UNITOKEN)
      assert.equal(0,await web3.eth.getBalance(instance.address))
      assert.ok(transaction)
    } catch (error) {
       assert.fail(error)
     }
  })

});
