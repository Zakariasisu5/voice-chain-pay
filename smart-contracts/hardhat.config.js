require('@nomiclabs/hardhat-ethers');
require('dotenv').config();

const { ZETA_RPC, DEPLOYER_KEY } = process.env;

/**
 * Hardhat config. To deploy to ZetaChain testnet, set ZETA_RPC and DEPLOYER_KEY in .env
 */
const networks = {
  localhost: {
    url: 'http://127.0.0.1:8545'
  }
};

if (ZETA_RPC && DEPLOYER_KEY) {
  networks.zetaTestnet = { url: ZETA_RPC, accounts: [DEPLOYER_KEY] };
}

module.exports = {
  solidity: {
    compilers: [{ version: '0.8.19' }]
  },
  networks
};
