const Web3Utils = require("web3-utils");
const Contract = require("web3-eth-contract");
var fs = require("fs");

//const jsonInterface = require("../artifacts/contracts/LFGToken.sol/LFGToken.json");
var jsonFile = "./artifacts/contracts/LFGToken.sol/LFGToken.json";
var parsed = JSON.parse(fs.readFileSync(jsonFile));
var abi = parsed.abi;

const banList = [
  "0x5c65dd9eb45bf0d25d3eb3ed4479378ddd6f4716",
  "0x1ac7808b112fff1baf47abd65cb321a6044bbe1d",
  "0x3896a1d01c7dad91a4affe9fc139e4de8820bf5e",
  "0xcca6df3c9e888ba411de5b4452c43356ee15f44e",
  "0xb6ef487fe9cb571791f443c9438e38d70da47c8a",
  "0xdcf3920539d9521a0ad01eeea390739e36934dd8",
  "0x103db4074aedf21152258f84049ed2275e2fc9ad",
  "0xe237d72e00e73fece61d63a941f31679cd9b9c94",
  "0x579fdea1feb7c30f8782fd98b64ddcd1cc8fbd9a",
  "0xbea6eaa4d05a9324fe19f7bdd48ec5bad3895ffc",
  "0x4484b839c627a80a4a6da57b57b8ae3c7169243c",
  "0x5821c378a5a85ad74b1f5e903dc09cf2ee708839",
  "0xbca391d5d462d4b326769001c61be78bd597fea0",
  "0x5fca4aa00fb3db73dc14064547e78df045636989",
  "0xfd1595ff634102678ebff521f8396c09348760ce",
  "0x2e9aac646986bcf1c3bc410deba6f65e9363b8ff",
  "0x79ce8bcc8b0b88e8c96c76d6521b49d7a24ebcfb",
  "0x17ec047622c000df03599026a3b39871ec9384db",
  "0x702e36fece712545ea3fc2592825be4efc5fa367",
  "0x541f0ae3e674924023b2e4d8117a009d508a0041",
];

// set provider for all later instances to use
Contract.setProvider("https://bsc-dataseed.binance.org/");

const contract = new Contract(abi, "0xF93f6b686f4A6557151455189a9173735D668154");

exports.handler = async () => {
  const res = await getLFGInfo();
  const response = {
    statusCode: 200,
    body: res,
  };

  return response;
};

const getLFGInfo = async () => {
  let totalSupply = 0;
  let maxSupply = 0;
  let circulationSupply = 0;
  try {
    /* global fetch */
    totalSupply = Number(Web3Utils.fromWei(await contract.methods.totalSupply().call()));
    circulationSupply = totalSupply;
    maxSupply = totalSupply;

    for (let i = 0; i < banList.length; i++) {
      circulationSupply =
        circulationSupply - Number(Web3Utils.fromWei(await contract.methods.balanceOf(banList[i]).call()));
    }
  } catch (e) {
    console.error(e);
  }

  return circulationSupply;

  // return {
  //     totalSupply: String(totalSupply),
  //     maxSupply: String(maxSupply),
  //     circSupply: String(circulationSupply),
  //     burned: String(Number(1000000000 - totalSupply)),
  // };
};

(async () => {
  console.log(await getLFGInfo());
})();
