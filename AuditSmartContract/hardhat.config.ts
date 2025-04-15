import * as dotenv from "dotenv";
import "@nomicfoundation/hardhat-toolbox";
import { HardhatUserConfig } from "hardhat/config";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    private: {
      url: process.env.NODE_URL || "", // Al 3-lea nod (stocare)
      accounts: [`${process.env.NODE_ADRESS}`],
    },
  },
};

export default config;
