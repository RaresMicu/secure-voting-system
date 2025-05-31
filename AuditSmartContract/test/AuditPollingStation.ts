import { expect } from "chai";
import { ethers } from "hardhat";

describe("VotingAudit", function () {
  let votingAudit: any;

  beforeEach(async () => {
    const VotingAudit = await ethers.getContractFactory("VotingAudit");
    votingAudit = await VotingAudit.deploy();
  });

  it("should initialize a polling station with parties", async () => {
    const parties = ["PartyA", "PartyB"];
    await votingAudit.initializeStation("CT-01-0193", parties);

    const votes = await votingAudit.getAllVotes("CT-01-0193", parties);
    expect(votes).to.deep.equal([0, 0]);
  });

  it("should update votes for a polling station", async () => {
    const parties = ["PartyA", "PartyB"];
    await votingAudit.initializeStation("CT-01-0193", parties);

    await votingAudit.updateVotes("CT-01-0193", parties, [10, 20]);
    const votes = await votingAudit.getAllVotes("CT-01-0193", parties);
    expect(votes).to.deep.equal([10, 20]);
  });

  it("should allow updateVotes on a non-initialized station and create it", async () => {
    const parties = ["PartyA", "PartyB"];
    await votingAudit.updateVotes("CT-02-0001", parties, [3, 4]);
    const votes = await votingAudit.getAllVotes("CT-02-0001", parties);
    expect(votes).to.deep.equal([3, 4]);
  });

  it("should emit VotesUpdated event on updateVotes", async () => {
    const parties = ["PartyA", "PartyB"];
    await votingAudit.initializeStation("CT-01-0193", parties);

    const tx = await votingAudit.updateVotes("CT-01-0193", parties, [5, 7]);
    const receipt = await tx.wait();
    const parsed = votingAudit.interface.parseLog(receipt.logs[0]);

    expect(parsed.name).to.equal("VotesUpdated");
    expect(parsed.args.pollingStationId).to.equal("CT-01-0193");
    expect(parsed.args.parties).to.deep.equal(parties);
    expect(parsed.args.votes.map((v: any) => Number(v))).to.deep.equal([5, 7]);
    expect(typeof parsed.args.timestamp).to.equal("bigint");
  });

  it("should revert if parties and votes length mismatch", async () => {
    const parties = ["PartyA", "PartyB"];
    await votingAudit.initializeStation("CT-01-0193", parties);

    await expect(
      votingAudit.updateVotes("CT-01-0193", parties, [1])
    ).to.be.revertedWith("Parties and votes length mismatch");
  });

  it("should revert getAllVotes if polling station does not exist", async () => {
    await expect(
      votingAudit.getAllVotes("NON-EXISTENT", ["PartyA"])
    ).to.be.revertedWith("Polling station does not exist");
  });
});
