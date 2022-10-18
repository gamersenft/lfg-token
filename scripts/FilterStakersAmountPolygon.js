Web3 = require("web3");
var fs = require("fs");

const {BigNumber} = require("bignumber.js");

var jsonFile = "./artifacts/contracts/Staking.sol/GamersePool.json";
var parsed = JSON.parse(fs.readFileSync(jsonFile));
var abi = parsed.abi;

const testWeb3 = new Web3("https://polygon-rpc.com/");

const stakingInst = new testWeb3.eth.Contract(abi, "0x09B7e814E56544Faa2306a83d17728d53CD23C49");
stakingInst.methods.startBlock().call(function (err, result) {
  console.log(result);
});

const startBlock = 29637408;
const endBlock = startBlock + ((3600 * 24) / 2) * 7;
const duration = 5000;

const initFunction = async () => {
  let events = [];

  BigNumber.config({ EXPONENTIAL_AT: 30 });

  for (i = startBlock; i <= endBlock; i += duration) {
    events = events.concat(
      await stakingInst.getPastEvents("Deposit", {
        fromBlock: i,
        toBlock: i + duration - 1 >= endBlock ? endBlock : i + duration - 1,
      })
    );
    events = events.concat(
      await stakingInst.getPastEvents("Withdraw", {
        fromBlock: i,
        toBlock: i + duration - 1 >= endBlock ? endBlock : i + duration - 1,
      })
    );
  }

  events = events.sort((a, b) => a.blockNumber > b.blockNumber);
  let results = {};

  for (i = 0; i < events.length; i++) {
    const user = events[i]["returnValues"]["user"];
    const amount = new BigNumber(events[i]["returnValues"]["amount"]).div(new BigNumber(10).pow(18)).toNumber();
    if (!results[user]) {
      results[user] = new BigNumber("0");
    }

    if (events[i].event == "Deposit") {
      results[user] = results[user].plus(amount);
    } else if (events[i].event == "Withdraw") {
      results[user] = results[user].minus(amount);
    }
  }

  const fs = require("fs");
  const file1 = fs.createWriteStream("data/polygon_top1.txt");
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

  const file = fs.createWriteStream("data/polygon_top.txt");
  response.forEach((v) => {
    file.write(v + "\n");
  });
};

initFunction();
