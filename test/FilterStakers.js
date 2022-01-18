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

stakingInst.getPastEvents('Deposit', {
   fromBlock: 14300586,
   toBlock: 14304850
}, function (error, events) {
   console.log("Length ", events.length);
   for(let i = 0; i < events.length; ++i) {
   const event = events[i];
   const user = event["returnValues"]["user"];
   const block = event["blockNumber"];
   if (!stakersMap.has(user)) {
      console.log("User,",user,",start_block,",block);
      stakersMap.set(user, block);
   }
} });
