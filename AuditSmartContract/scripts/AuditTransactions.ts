import { ethers } from "hardhat";

async function main() {
  const contractAddress = "0x2A62417a696075Ff88FC7b7B09e8AFA19e6A5598";
  const TRANSACTION_HASH =
    "0xeef5ced947dafc723d27f05fe0eb67ecd6c18f590c451162d3293402862d6270";

  // Instanta contractului VotingAudit
  const VotingAudit = await ethers.getContractAt(
    "VotingAudit",
    contractAddress
  );

  // Detaliile tranzactiei
  const tx = await ethers.provider.getTransaction(TRANSACTION_HASH);
  if (!tx) {
    throw new Error("Transaction not found");
  }

  //Toate detaliile tranzactiei cu unele informatii hash-uite
  console.log("Transaction details:", tx);

  // Decodarea datelor tranzactiei
  const decodedData = VotingAudit.interface.parseTransaction({
    data: tx.data,
    value: tx.value,
  });

  //Numele functiei apelate si argumentele acesteia
  console.log("Function Name:", decodedData?.name);
  console.log("Arguments:", decodedData?.args);

  // Log-uri emise de contractul VotingAudit
  await parseTransactionLogs(VotingAudit, TRANSACTION_HASH);
}

// Functie pentru parsarea log-urilor tranzactiei
async function parseTransactionLogs(contract: any, transactionHash: string) {
  const receipt = await ethers.provider.getTransactionReceipt(transactionHash);

  if (!receipt) {
    console.log("Transaction not mined yet.");
    return;
  }

  console.log(`Parsing logs for transaction: ${transactionHash}`);

  for (const log of receipt.logs) {
    try {
      const parsedLog = contract.interface.parseLog(log);
      console.log("Event:", parsedLog.name);
      console.log("Arguments:", parsedLog.args);
    } catch (error) {
      continue;
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
