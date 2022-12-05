Web3 = require("web3");
var fs = require("fs");

const {BigNumber} = require("bignumber.js");

var jsonFile = "./artifacts/contracts/Staking.sol/GamersePool.json";
var parsed = JSON.parse(fs.readFileSync(jsonFile));
var abi = parsed.abi;

const testWeb3 = new Web3("https://bsc-dataseed4.binance.org/");
// const testWeb3 = new Web3("https://bsc-dataseed1.binance.org");

const stakingInst = new testWeb3.eth.Contract(abi, "0xCac66Dd9ffe2a77B3b0025856dDCB40Dad37B420");
stakingInst.methods.startBlock().call(function (err, result) {
  console.log(result);
});

const startBlock = 16395540;
const endBlock = startBlock + ((3600 * 24) / 3) * 7;
const duration = 5000;

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const initFunction = async () => {
  let events = [];

  for (i = startBlock; i <= endBlock; i += duration) {

    events = events.concat(
      await stakingInst.getPastEvents("Deposit", {
        fromBlock: i,
        toBlock: i + duration - 1 >= endBlock ? endBlock : i + duration - 1,
      })
    );
    console.log("fromBlock ", i);
    await delay(1000);

    events = events.concat(
      await stakingInst.getPastEvents("Withdraw", {
        fromBlock: i,
        toBlock: i + duration - 1 >= endBlock ? endBlock : i + duration - 1,
      })
    );
    await delay(1000);
  }

  events = events.sort((a, b) => a.blockNumber > b.blockNumber);
  let results = {};

  for (i = 0; i < events.length; i++) {
    const user = events[i]["returnValues"]["user"];
    const amount = new BigNumber(events[i]["returnValues"]["amount"]).div(new BigNumber(10).pow(18)).toNumber();
    if (!results[user]) {
      results[user] = 0;
    }

    if (events[i].event == "Deposit") {
      results[user] += amount;
    } else if (events[i].event == "Withdraw") {
      results[user] -= amount;
    }
  }

  const fs = require("fs");
  const file1 = fs.createWriteStream("data/top1.txt");
  Object.keys(results).forEach((v) => {
    file1.write(v + " " + results[v] + "\n");
  });

  let response = [];
  Object.keys(results).forEach((key) => {
    if (results[key] >= 10000) {
      response.push(key);
    }
  });

  console.log(response.length);

  const file = fs.createWriteStream("data/top.txt");
  response.forEach((v) => {
    file.write(v + "\n");
  });
};

initFunction();
