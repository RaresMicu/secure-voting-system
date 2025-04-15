import * as dotenv from "dotenv";
const fs = require("fs");
const Wallet = require("ethereumjs-wallet").default;

dotenv.config();

const keystoreFile = process.env.KEYSTORE_PATH;
const password = fs.readFileSync(process.env.PASSWORD_FILE, "utf8").trim();

const keystore = JSON.parse(fs.readFileSync(keystoreFile));
Wallet.fromV3(keystore, password)
  .then((wallet) => {
    console.log("Address:", wallet.getAddressString());
    console.log("Private Key:", wallet.getPrivateKeyString());
  })
  .catch((err) => {
    console.error("Error decrypting wallet:", err);
  });
