Web3 = require("web3");
var fs = require("fs");

const {BigNumber} = require("bignumber.js");

var jsonFile = "./artifacts/contracts/LFGVesting.sol/LFGVesting.json";
var parsed = JSON.parse(fs.readFileSync(jsonFile));
var abi = parsed.abi;

const testWeb3 = new Web3("https://bsc-dataseed4.binance.org/");

const vestingInst = new testWeb3.eth.Contract(abi, "0x5C65dd9eB45bf0d25D3Eb3ed4479378ddD6F4716");

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

async function getVestingInfo(addresses, resultObject, waitTimeInMs) {
  for (index in addresses) {
    const address = addresses[index];

    vestingInst.methods.getWhitelist(address).call(function (err, result) {
      resultObject[address] = result;
      //console.log("address ", address, "vesting amount ", result.lfgAmount, " claimed amount ", result.distributedAmount);
    });
  }
  await delay(waitTimeInMs);
}

// strategy 10, CEX pool, but it is 0
const strategy_addresses = [
  "0x18439a5570C04912b52Cf2fF8020C72b9087B4B0",
  //   "0x6dcb6398618A009bE979B8c22Bf07B0607A87532",
  //   "0xA5C28F777DC616F63Ba1eA6c230d8eda83a73fC7",
];

// Not added in V2 vesting contract
const ecosystem_addresses = ["0x3896A1d01C7daD91a4aFfe9fc139e4DE8820bf5E"];

// Not added in V2 vesting contract
const markting_addresses = ["0x7A4cB7d7739f40db9aEAa09865401426c41316e7"];

// Not added in V2 vesting contract
// const team_addresses = [
//   "0x3378F1288481446a44502AE47249b8d1998A02DE",
//   "0x29974C6764De21E60B687ABFAb6FedC69e6AF7a6",
//   "0x526dc338665B1a4150E0cf84330A60247b9FA5b6",
// ];

const partnership_addresses = [
  //   "0x4484B839C627A80A4A6DA57B57b8Ae3C7169243C",
  //"0xa79e9511aa19C6fa4eBEDb60b2Eb92e503753615",
  //   "0x46aC169cFBC2b720b544225aA113F22303B4dddc",
  //"0xc9aa7A2EB0Bdf058d27e32389790D73cE03b25B2",
  //"0xE58FDbd6258d0CB37ad05c000E7466f201664211",
  //   "0x9c04D5b22D2A591585Ed0d5A5A07F13f59Ccd03e",
  //   "0xd71D9fc109622E8EBbf089f946f55cAa7ded41b0",
  //   "0xe8A06462628b49eb70DBF114EA510EB3BbBDf559",
  //   "0xF0C5c86d7E8D65912b7ad3a9F125508A71f87719",
  //   "0xe44C5e7556ba39d30C29202F545A29cffa63039b",
  //   "0x21941AE82cb4866500Ff4Ee2c5Ebbf041C346E65",
  //   "0x33BE7D5407AaC6b5a344630A73d77275826C0Ff0",
  //   "0x458B67d7FFB127402b683ad7Aa44984fdD6FB042",
];

// strategy 3
const advisor_addresses = [
  "0xa79e9511aa19C6fa4eBEDb60b2Eb92e503753615",
  "0xc9aa7A2EB0Bdf058d27e32389790D73cE03b25B2",
  "0xE58FDbd6258d0CB37ad05c000E7466f201664211",
];

// strategy 1
const seed_addresses = [
  "0xb5a5B9d508AD42Bb3d529550EB2eF790004Db146",
  "0x545B8761179d08E15CE4788bB028f2a4a8efF624",
  "0x4bA5Ca72C0d647eF13c7c6903199BD3dB7Bc6f9f",
  "0x17ec047622C000Df03599026A3B39871EC9384DB",
  "0x94Bf865AAFa058dF12eb446639fbE5c4e43944d0",
  "0x5821c378A5a85AD74B1f5E903dC09CF2eE708839",
];

const privatesale_addresses = [
  "0xa50f89381301Decb11F1918586f98c5f2077e3Ca",
  "0xFFE819bAF6D16F8Ad75634a036B67856BbD85a0b",
  "0x3B722bfB1c27B1Edc6C9C2e057c590a9ee57B2b0",
  "0x0318Ecad565D72e7A97d047dA37d3431bdFeF4FC",
  "0x2F3A1cFF3cB413A4Dc8c5Fb9a80cAc42DaEFB338",
  "0x752F74787824b093188ba30138C4c3833D5D7e66",
  "0xf41399aAc0D78cC955108E12916204d90FAff875",
  "0x79Ce8Bcc8b0B88e8C96C76D6521B49d7A24EBcfB",
  "0x9343873867756F9E8Ca203b80b70097e222FDbB3",
  "0xd0d0bF0a5b31932dcE9a6b362CDDF1a6d629b5b7",
  "0xa497cBBAB194d6bf017BcC2E01D961C2E3EC6dae",
  "0xFC1d3fCA99cE3F3939d6A3761D39e334a11a8C2A",
  "0xfbC9a49c0a29CbcEbDdE14BC6E6d221dA9e430Cf",
  "0x887b4B08BA619D629FFf17DC74380640BF55702F",
  "0x5E0FA68cD7950220e16245cb6789E94D96758F84",
  "0x06A3920354fcf9529FBbE3a0A4bB436e5538be9a",
  "0x494E35c0A11dc16a109fc161d785385F874F2359",
  "0xa787A56c43847A3B5a0110d0B5E004E47F57B22e",
  "0xAe86cf0e6BB7094AC4A6E0F344E54eD15C6FC7a6",
  "0x8709284a3e1B9b992840099b3c5F86c03Ec14292",
  "0x9f7b75c2205d10f6F1FFc73C33dDb805167D27D5",
  "0x49581043B2c45469d3FDd7D8Dbd3287c23A4e9bB",
  "0x5c70755d050a03e7F2bA817528A238De0E98d526",
  "0x7C68F64C839A7c8e78d3Da44ecd8f353776Edd80",
  "0x4E3bCD2734390f9CC02cD10F37aCf59EbE548e2f",
  "0xf44ec09221653db5691265bA587e196257DA5F53",
  "0x5c10763C17173EB9FE5ee66d0Bf987480Dedd710",
  "0xF9fd9FAd2f2Eb6E441D30983FDD9Ae2E5c5c80b8",
  "0x507Cf5196F4f030D57e1ce34aB1DB0b476Cac9fC",
  "0xd3CCf31820301F0955ca2d7c190F2b3AadB639D0",
  "0xFB9deb5b6C488Fe61e1A8A482c5cEF1A583321d2",
  "0x6cDAcd9cD2d4A824BCe5E91F4899c959F2693a9f",
  "0x9fe553de68865F425d8071C81640855A7C9613eb",
  "0x9779C2850B376B5386f2fA531f745eeA31B8c683",
  "0x0095B77ceB0178AAa38DC14a13C95a902d021BED",
  "0x320302f8553E87c6A30d3827200798D47B28d8a3",
  "0xAe3E9Cf3a1b39C27f8cCa96AFEbBdDEa6C0e0B56",
  "0x9fb358896C9B2f872be9006E80bBAa810b8E142d",
  "0xcE63bc5f0f628ea3911AC5542132B4482491ff48",
  "0x85B2b25BCb79A4945c1d7ad5e773f4af5b7167c3",
  "0x5a87E9A0A765fE5A69fA6492D3C7838DC1511805",
  "0x81289cFbD5a01293391D1ab9dC46c5ee21371341",
  "0xa8Ea663c1fB87E87A940Ddd848Ce3a99dEA0490A",
  "0x309D3522F7C3a4fe6AC6bb8A2f3916d24C643DF7",
  "0x648cCa9B5304f29873aB5FcE6Ea64ed10000A4Ef",
  "0x98cfEac962bBcE5a3810DEa12B6CE467e9985315",
];

function printResultByAddress(addresses, objectResult) {
  for (const index in addresses) {
    const address = addresses[index];
    const result = objectResult[address];
    if (result == null) {
      console.log("address ", address, " is not in white list");
      continue;
    }

    let lfgAmount = new BigNumber(result.lfgAmount);
    let distributedAmount = new BigNumber(result.distributedAmount);
    let left = new BigNumber(lfgAmount).minus(distributedAmount);
    console.log(
      "address,",
      address,
      ",vesting amount,",
      lfgAmount.toString(),
      ",claimed amount,",
      result.distributedAmount,
      ",left amount,",
      left.toString(),
      ",strategy,",
      result.vestingOption
    );
  }
}

(async () => {
  const delayTime = 2000;

  // This one is important, without it the big number will be printed as scientific format
  BigNumber.config({EXPONENTIAL_AT: 30});

  let strategeResults = Object();
  await getVestingInfo(strategy_addresses, strategeResults, delayTime);
  console.log("strategy vesting results:");
  printResultByAddress(strategy_addresses, strategeResults);

  let ecosystemResults = Object();
  await getVestingInfo(ecosystem_addresses, ecosystemResults, delayTime);
  console.log("eco-system results:");
  printResultByAddress(ecosystem_addresses, ecosystemResults);

  let marketingResults = Object();
  await getVestingInfo(markting_addresses, marketingResults, delayTime);
  console.log("markerting results:");
  printResultByAddress(markting_addresses, marketingResults);

  //   let teamResults = Object();
  //   await getVestingInfo(team_addresses, teamResults, delayTime);
  //   console.log("team results:");
  //   printResultByAddress(team_addresses, teamResults);

  let partnershipResults = Object();
  await getVestingInfo(partnership_addresses, partnershipResults, delayTime * 2);
  console.log("partnership results:");
  printResultByAddress(partnership_addresses, partnershipResults);

  let advisorResults = Object();
  await getVestingInfo(advisor_addresses, advisorResults, delayTime);
  console.log("advisor results:");
  printResultByAddress(advisor_addresses, advisorResults);

  let seedResults = Object();
  await getVestingInfo(seed_addresses, seedResults, delayTime);
  console.log("seed results:");
  printResultByAddress(seed_addresses, seedResults);

  let privatesaleResults = Object();
  await getVestingInfo(privatesale_addresses, privatesaleResults, delayTime * 2);
  console.log("private sale results:");
  printResultByAddress(privatesale_addresses, privatesaleResults);
})();
