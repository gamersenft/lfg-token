const fs = require("fs");
const { parse } = require("csv-parse");
const Web3 = require('web3');

var jsonFile = "./artifacts/contracts/TokenAirDrop.sol/TokenAirDrop.json";
var parsed = JSON.parse(fs.readFileSync(jsonFile));
var abi = parsed.abi;

const testWeb3 = new Web3("https://data-seed-prebsc-1-s1.binance.org:8545");

const airdropInst = new testWeb3.eth.Contract(abi, "0x1ac7808b112FfF1bAf47aBd65cB321A6044Bbe1D");
stakingInst.methods.startBlock().call(function (err, result) {
   console.log(result);
});

(async () => {
  const inputpath = "./test/AirdropLists.csv";
  fs.readFile(inputpath, function (err, fileData) {
    console.log(fileData);
    parse(fileData, { columns: false, trim: true }, function (err, rows) {
      // Your CSV data is in an array of arrys passed to this callback as rows.
      console.log(rows);
    });
  });
})();
