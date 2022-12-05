Web3 = require("web3");
var fs = require("fs");

const {BigNumber} = require("bignumber.js");

var jsonFile = "./artifacts/contracts/LFGToken.sol/LFGToken.json";
var parsed = JSON.parse(fs.readFileSync(jsonFile));
var abi = parsed.abi;

const testWeb3 = new Web3("https://bsc-dataseed4.binance.org/");

const tokenInst = new testWeb3.eth.Contract(abi, "0xF93f6b686f4A6557151455189a9173735D668154");

const startBlock = 16395540;
const endBlock = 19943411;
const duration = 5000;

const initFunction = async () => {
  let sum = new BigNumber("0");
  let lastApprovalAmount = new BigNumber("0");
  for (block = startBlock; block <= endBlock; block += duration) {
    let events = await tokenInst.getPastEvents("Approval", {
      fromBlock: block,
      toBlock: block + duration - 1 >= endBlock ? endBlock : block + duration - 1,
    });

    events = events.sort((a, b) => a.blockNumber > b.blockNumber);

    for (i = 0; i < events.length; i++) {
      const owner = events[i]["returnValues"]["owner"];
      const spender = events[i]["returnValues"]["spender"];
      if (
        owner != "0xbea6Eaa4D05A9324fE19f7bDD48ec5BaD3895fFC" ||
        spender != "0xCac66Dd9ffe2a77B3b0025856dDCB40Dad37B420"
      ) {
        continue;
      }

      const amount = new BigNumber(events[i]["returnValues"]["value"]).div(new BigNumber(10).pow(18)).toNumber();
      if (amount > lastApprovalAmount) {
        sum = sum.plus(amount);
        console.log(
          owner +
            "," +
            spender +
            "," +
            events[i]["transactionHash"] +
            "," +
            events[i]["blockNumber"] +
            "," +
            amount.toString()
        );
      }
      lastApprovalAmount = amount;
    }
  }

  console.log("sum: ", sum.toString());
};

initFunction();
