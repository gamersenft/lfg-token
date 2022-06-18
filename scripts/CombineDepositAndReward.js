Web3 = require("web3");
var fs = require("fs");
const lineReader = require("line-reader");

const {BigNumber} = require("bignumber.js");

stakedAddress = {};

BigNumber.config({EXPONENTIAL_AT: 30});

const buffer1 = fs.readFileSync("./Data/polygon_top1.txt");

let content = buffer1.toString();
let lines = content.split(/\r?\n/);
let deposits = {};
for (const index in lines) {
  let line = lines[index];
  if (line.length <= 0) {
    break;
  }
  let dataArray = line.split(" ");
  deposits[dataArray[0]] = new BigNumber(dataArray[1]);
}

const buffer2 = fs.readFileSync("./Data/PendingRewards.txt");
content = buffer2.toString();
lines = content.split(/\r?\n/);
let rewards = {};
for (const index in lines) {
  let line = lines[index];
  if (line.length <= 0) {
    break;
  }
  let dataArray = line.split(" ");
  rewards[dataArray[0]] = new BigNumber(dataArray[1]);
}

for (const address in deposits) {
  let sum = deposits[address].plus(rewards[address]);
  console.log(address + "," + deposits[address].toString() + "," + rewards[address].toString() + "," + sum.toString());
}
