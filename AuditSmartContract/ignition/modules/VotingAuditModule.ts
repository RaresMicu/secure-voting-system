import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const VotingAuditModule = buildModule("VotingAuditModule", (m) => {
  const votingAudit = m.contract("VotingAudit", []);

  return { votingAudit };
});

export default VotingAuditModule;
