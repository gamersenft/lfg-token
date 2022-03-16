Web3 = require('web3');
var fs = require('fs');

const { BigNumber } = require('bignumber.js');

var jsonFile = "./build/contracts/GamersePool.json";
var parsed = JSON.parse(fs.readFileSync(jsonFile));
var abi = parsed.abi;

const testWeb3 = new Web3("https://bsc-dataseed4.binance.org/");

const stakingInst = new testWeb3.eth.Contract(abi, "0x1ac7808b112FfF1bAf47aBd65cB321A6044Bbe1D");
stakingInst.methods.startBlock().call(function (err, result) {
   console.log(result);
});

let stakersMap = new Map();

const threshold = new BigNumber(1e22);

stakingInst.getPastEvents('Deposit', {
   fromBlock: 14300586,
   toBlock: 14304850
}, function (error, events) {
   console.log("Length ", events.length);
   for(let i = 0; i < events.length; ++i) {
   const event = events[i];
   const user = event["returnValues"]["user"];
   const amount = new BigNumber(event["returnValues"]["amount"]);
   const block = event["blockNumber"];
   if (!stakersMap.has(user) && amount.isGreaterThan(threshold)) {
      console.log("User,",user,",amount,", event["returnValues"]["amount"],",start_block,",block);
      stakersMap.set(user, block);
   }
} });
