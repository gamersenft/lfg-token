Web3 = require('web3');
var fs = require('fs');
var fetch = require("node-fetch");

const { BigNumber } = require('bignumber.js');

var jsonFile = "./build/contracts/LFGToken.json";
var parsed = JSON.parse(fs.readFileSync(jsonFile));
var abi = parsed.abi;

const testWeb3 = new Web3("https://bsc-dataseed4.binance.org/");

const addresses =
["0x5c65dd9eb45bf0d25d3eb3ed4479378ddd6f4716",
"0xb6ef487fe9cb571791f443c9438e38d70da47c8a",
"0xdcf3920539d9521a0ad01eeea390739e36934dd8",
"0x103db4074aedf21152258f84049ed2275e2fc9ad",
"0xfd1595ff634102678ebff521f8396c09348760ce",
"0xbea6Eaa4D05A9324fE19f7bDD48ec5BaD3895fFC",
"0x3896A1d01C7daD91a4aFfe9fc139e4DE8820bf5E",
"0x7A4cB7d7739f40db9aEAa09865401426c41316e7",
"0x09d8b87f125b1EDA9c5A76dB39322c5E3BCb9fC2",
"0xbca391d5d462d4b326769001c61be78bd597fea0",
"0xd1DED8e429cC944e8a14cFcc1ed9286BE3E856E7",
"0xbea6Eaa4D05A9324fE19f7bDD48ec5BaD3895fFC"];

const lftToken = new testWeb3.eth.Contract(abi, "0x960a69E979d2F507E80121f41d984Ea8aD83cD76");

const delay = ms => new Promise(res => setTimeout(res, ms));
let totalDeduct = new BigNumber("0");

(async () => {

   const getTotalSupply = async () => {
      const response = await fetch('https://cknvh68seb.execute-api.us-east-1.amazonaws.com/api/lfg-cmc-info');
      console.log("response ", response.toString());
      const myJson = await response.json(); //extract JSON from the http response
      console.log("myJson ", myJson);
      return myJson;
    }

    const totalSupply = new BigNumber(await getTotalSupply());
    console.log("totalSupply ", totalSupply.toString());
   
   for (let index in addresses) {
      const address = addresses[index];
      lftToken.methods.balanceOf(address).call(function (err, result) {
         let lfgAmount = new BigNumber(result);
         lfgAmount = lfgAmount.div(new BigNumber("1e18"));
         console.log(lfgAmount.toString());
         totalDeduct = totalDeduct.plus(lfgAmount);
      });

      await delay(500);
   }

   console.log("totalDeduct ", totalDeduct.toString());

   let cs = totalSupply.minus(totalDeduct);
   console.log("Circling supply ", cs.toString());
})();
