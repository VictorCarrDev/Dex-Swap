require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-truffle5");
require('@openzeppelin/hardhat-upgrades');
// require("hardhat-gas-reporter");
// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    // localhost:{
      //   url:"http://127.0.0.1:8545"
      // }
      hardhat: {
        forking: {
          url: "https://eth-mainnet.alchemyapi.io/v2/sJbMk2w9T0Hrql2WqOo0Lyd-z0jZv99q",
          blockNumber: 11589707
        }
      }},
  solidity: "0.8.3",
};

