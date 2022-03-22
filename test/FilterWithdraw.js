Web3 = require("web3");
var fs = require("fs");

const {BigNumber} = require("bignumber.js");

var jsonFile = "./artifacts/contracts/Staking.sol/GamersePool.json";
var parsed = JSON.parse(fs.readFileSync(jsonFile));
var abi = parsed.abi;

const testWeb3 = new Web3("https://bsc-dataseed4.binance.org/");

const stakingInst = new testWeb3.eth.Contract(abi, "0x1ac7808b112FfF1bAf47aBd65cB321A6044Bbe1D");
stakingInst.methods.startBlock().call(function (err, result) {
  console.log(result);
});

const startBlock = 15214117; //14300586; //;
const endBlock   = 16110288; // ;
const range = 3000;
const times = Math.ceil((endBlock - startBlock) / range);

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

async function getDeposits(fromBlock, toBlock) {
  //console.log("fromBlock ", fromBlock, " toBlock ", toBlock);
  stakingInst.getPastEvents(
    "Withdraw",
    {
      fromBlock: fromBlock,
      toBlock: toBlock,
    },
    function (error, events) {
      //console.log("Events ", JSON.stringify(events));
      //console.log("Length ", events.length);
      for (let i = 0; i < events.length; ++i) {
        const event = events[i];
        const user = event["returnValues"]["user"];
        //const amount = new BigNumber(event["returnValues"]["amount"]);
        const block = event["blockNumber"];

        console.log("User,", user, ",amount,", event["returnValues"]["amount"], ",start_block,", block);
      }
    }
  );
  await delay(4000);
}

(async () => {
  for (var time = 0; time < times; ++time) {
    let fromBlock = startBlock + time * range;
    let toBlock = fromBlock + range;
    if (toBlock > endBlock) {
      toBlock = endBlock;
    }
    await getDeposits(fromBlock, toBlock);
  }
})();
