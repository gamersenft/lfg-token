module.exports = [
  "0xF93f6b686f4A6557151455189a9173735D668154", // process.env.LP_TOKEN_ADDRESS",
  "0xF93f6b686f4A6557151455189a9173735D668154", // process.env.LFG_TOKEN_ADDRESS,
  "0xbea6Eaa4D05A9324fE19f7bDD48ec5BaD3895fFC", // process.env.REWARD_HOLDER_ADDRESS,
  "0xd1DED8e429cC944e8a14cFcc1ed9286BE3E856E7", // process.env.CUSTODY_ADDRESS,
  "579105860000000000", // 0.57910586 LFG reward per block, total reward 1M
  "24952200", // start block, 20 Jan 2023, 2PM UTC
  "26679000", // 60 days, every day 28780 blocks
  "5000", // 50% reward penality for early withdraw
  "1728000", // penality duration in seconds, 20 days, 20 * 24 * 3600
  "50000000000000000000000", // minimum stake amount to get NFT airdrop, 50K
  "1439000", // minimum stake blocks to get NFT airdrop, 50 Days * 28780
];
