module.exports = [
  "0xbea6Eaa4D05A9324fE19f7bDD48ec5BaD3895fFC", // process.env.MULTISIG_ADDRESS,
  "0x411bE1E071675dF40fE1c08CA760Bb7aA707CEdF", // process.env.LP_TOKEN_ADDRESS",
  "0x411bE1E071675dF40fE1c08CA760Bb7aA707CEdF", // process.env.LFG_TOKEN_ADDRESS,
  "0xd1DED8e429cC944e8a14cFcc1ed9286BE3E856E7", // process.env.CUSTODY_ADDRESS,
  "833333333333333000",                         // Rewards per block, 0.8333, total 2M
  "29121346",                                   // Start block, around 3 Jun 2022, 14::00 UTC
  "31521346",                                   // Bonus end block = start block + 60 * 40000
  "5000",                                       // Penalty rate, 50%
  "1728000",                                    // Penalty duration in seconds, 20 days
  "10000000000000000000000",                    // Staking for NFT airdrop, 10K
  "280000"                                      // Staking duration in blocks for NFT airdrop
];
