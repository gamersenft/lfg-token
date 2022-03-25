const fs = require("fs");
const { parse } = require("csv-parse");
var Web3 = require("web3");
const Tx = require("ethereumjs-tx");
require("dotenv").config();

var jsonFile = "./artifacts/contracts/TokenAirDrop.sol/TokenAirDrop.json";
var parsed = JSON.parse(fs.readFileSync(jsonFile));
var abi = parsed.abi;

if (!process.env.MUMBAI_PRIVKEY)
  throw new Error("RINKEBY_PRIVKEY missing from .env file");

const testWeb3 = new Web3("https://data-seed-prebsc-1-s1.binance.org:8545");

const airdropInst = new testWeb3.eth.Contract(
  abi,
  "0x6C701fcd96657fAdB7BF56CA1955B1CBFF0B9A78"
);

airdropInst.methods.lfgToken().call(function (err, result) {
  console.log(result);
});

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

let privateKey = Buffer.from(process.env.MUMBAI_PRIVKEY, "hex");
console.log("privateKey ", privateKey);

//let account = testWeb3.eth.accounts.privateKeyToAccount(privateKey);

//console.log(account);

(async () => {
  await delay(2000);

  let dataArray;

  const inputpath = "./test/AirdropLists.csv";
  fs.readFile(inputpath, function (err, fileData) {
    //console.log(fileData);
    parse(fileData, { columns: false, trim: true }, function (err, rows) {
      // Your CSV data is in an array of arrys passed to this callback as rows.
      //console.log(rows);
      dataArray = rows;
    });
  });

  await delay(2000);

  console.log("dataArray.length ", dataArray.length);

  let batch = 100; // dataArray.length;
  let times = 1; // Math.ceil(dataArray.length / batch);
  //let times = 1;
  for (let time = 0; time < times; ++time) {
    console.log("Airdrip batch no ", time);
    let start = batch * time;
    let end = batch * (time + 1);
    if (end > dataArray.length) {
      end = dataArray.length;
    }
    let addresses = new Array();
    let amounts = new Array();
    console.log("start ", start, " end ", end);
    for (let index = start; index < end; ++index) {
      addresses.push(dataArray[index][0]);
      amounts.push(dataArray[index][2]);
    }
    //console.log(addresses);
    //console.log(amounts);
    //airdropInst.methods.airDrop(addresses, amounts).send({from: account.address});

    // airdropInst.methods
    //   .airDrop(addresses, amounts)
    //   .estimateGas({ from: "0x3ca3822163D049364E67bE19a0D3B2F03B7e99b5" })
    //   .then(function (gasAmount) {
    //     console.log("gasAmount ", gasAmount);
    //   })
    //   .catch(function (error) {
    //     console.log("error ", error);
    //   });

    var encodedABI = airdropInst.methods
      .airDrop(addresses, amounts)
      .encodeABI();
    //console.log("encodedABI ", encodedABI);

    var rawTx = {
      nonce: "0x101",
      gasPrice: 20e9, //"0x09184e72a000",
      gasLimit: 25687739, //"16488493", 1,878,826
      to: "0x0000000000000000000000000000000000000000",
      value: "0x00",
      //value: testWeb3.utils.toHex(testWeb3.utils.toWei('1', 'gwei')),
      gas: 25687739,
      data: encodedABI,
    };

    var tx = new Tx(rawTx);
    tx.sign(privateKey);

    var serializedTx = tx.serialize();
    //console.log(serializedTx.toString("hex"));

    // This is not working, the transaction cannot be mined.
    testWeb3.eth
      .sendSignedTransaction("0x" + serializedTx.toString("hex"))
      .on("receipt", console.log);
  }
})();
