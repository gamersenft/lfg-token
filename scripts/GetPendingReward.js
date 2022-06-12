Web3 = require("web3");
var fs = require("fs");
const lineReader = require("line-reader");

const {BigNumber} = require("bignumber.js");

var jsonFile = "./artifacts/contracts/Staking.sol/GamersePool.json";
var parsed = JSON.parse(fs.readFileSync(jsonFile));
var abi = parsed.abi;

const testWeb3 = new Web3("https://polygon-rpc.com/");

const stakingInst = new testWeb3.eth.Contract(abi, "0xc06dfe944556CDC44807BcD5240625dF08D18556");

stakedAddress = {};

lineReader.eachLine("./Data/top1.txt", (line, last) => {
  const array = line.split(" ");
  stakedAddress[array[0]] = new BigNumber(array[1]);

  stakingInst.methods.pendingReward(array[0]).call(function (err, result) {
    console.log(array[0], " ", result);
  });
});

// console.log(stakedAddress);

// for (const address in stakedAddress) {
//   console.log(address);
//   stakingInst.methods.pendingReward(address).call(function (err, result) {
//     console.log(result);
//   });
// }
