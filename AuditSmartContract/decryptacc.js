const fs = require('fs');
const Wallet = require('ethereumjs-wallet').default;

const keystoreFile = '../node3/keystore/UTC--2024-11-16T17-50-04.171183500Z--0bc95f8413e96ec080550ac5976ab34edf7a21cf';
const password = fs.readFileSync('../node3/password.txt', 'utf8').trim();

const keystore = JSON.parse(fs.readFileSync(keystoreFile));
Wallet.fromV3(keystore, password).then(wallet => {
  console.log('Address:', wallet.getAddressString());
  console.log('Private Key:', wallet.getPrivateKeyString());
}).catch(err => {
  console.error('Error decrypting wallet:', err);
});
