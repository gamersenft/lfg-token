const HDWalletProvider = require("@truffle/hdwallet-provider");
require("dotenv").config();
module.exports = {
  networks: {
    development: {
      host: "127.0.0.1", // Localhost (default: none)
      port: 8545, // Standard Ethereum port (default: none)
      network_id: "*", // Any network (default: none)
      from: process.env.OWNER,
    },
    ropsten: {
      provider: () => new HDWalletProvider(process.env.MNEMONIC, process.env.ROPSTEN, 0),
      network_id: 3,
      gas: 8000000,
      gasPrice: 240000000000,
      timeoutBlocks: 5000000, // # of blocks before a deployment times out  (minimum/default: 50)
      skipDryRun: true, // Skip dry run before migrations? (default: false for public nets )
      // confirmations: 2,    // # of confs to wait between deployments. (default: 0)
      // timeoutBlocks: 200,  // # of blocks before a deployment times out  (minimum/default: 50)
      // skipDryRun: true     // Skip dry run before migrations? (default: false for public nets )
    },
    rinkeby: {
      provider: () => new HDWalletProvider(process.env.MNEMONIC, process.env.RINKEBY),
      network_id: 4,
      gas: 8000000,
      gasPrice: 240000000000,
      skipDryRun: true, // Skip dry run before migrations? (default: false for public nets )
    },
    // rinkeby: {
    //   provider: () =>
    //     new HDWalletProvider({
    //       mnemonic: {
    //         phrase: process.env.MNEMONIC,
    //       },
    //       providerOrUrl: process.env.RINKEBY,
    //       numberOfAddresses: 1,
    //       shareNonce: true,
    //     }),
    //   network_id: "4",
    // },
    testnet: {
      provider: () => new HDWalletProvider(process.env.MNEMONIC, `https://data-seed-prebsc-1-s1.binance.org:8545`),
      network_id: 97,
      skipDryRun: true,
    },
    mainnet: {
      provider: () => new HDWalletProvider(process.env.MNEMONIC, process.env.MAINNET, 0),
      network_id: 1,
      gas: 8000000,
      gasPrice: 240000000000,
      timeoutBlocks: 5000000, // # of blocks before a deployment times out  (minimum/default: 50)
      skipDryRun: true, // Skip dry run before migrations? (default: false for public nets )
    },
  },
  //
  // Configure your compilers
  compilers: {
    solc: {
      version: "0.6.12", // Fetch exact version from solc-bin (default: truffle's version)
      // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
      settings: {
        // See the solidity docs for advice about optimization and evmVersion
        optimizer: {
          enabled: false,
          runs: 200,
        },
        //  evmVersion: "byzantium"
      },
    },
  },

  plugins: ["truffle-plugin-verify"],
  api_keys: {
    etherscan: process.env.ETHERAPI, // Add  API key
    bscscan: process.env.BSCAPI,
  },
};
