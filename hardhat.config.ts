import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

// Added for UUPS upgradable standard
import '@openzeppelin/hardhat-upgrades';

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.3",
    settings: {
      optimizer: {
        enabled: true,
        runs: 2**32-1,     // (2**32-1) Optimized for SmartContract usage, not deployment cost.
      },
    },
  },
};

export default config;
