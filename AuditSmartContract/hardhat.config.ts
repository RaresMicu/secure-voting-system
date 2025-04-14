import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    private: {
      url: "http://127.0.0.1:8504", // Al 3-lea nod (stocare)
      accounts: [
        `0x0c24b6359bdfce13f7db12aa59fb3eb57528ca324f50de1d85b55765ce705f06`,
      ],
    },
  },
};

export default config;
