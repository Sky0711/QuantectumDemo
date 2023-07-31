import { ethers } from "hardhat";
import { expect } from "chai";
import { Contract, Signer } from "ethers";
import { Deployer } from "../scripts/deploy";

describe("EarthquakeInsurance", function () {
  let earthquakeInsurance: Contract;
  let protectionNFT: Contract;
  let owner: Signer;
  let addr1: Signer;
  let addr2: Signer;
  let zeroAddress: string;

  // Constants used across multiple test cases
  const zone = "Zone1";
  const value = ethers.utils.parseEther("1");

  beforeEach("Deploying contracts and setting up signers", async function () {
    const deployer = new Deployer();
    await deployer.deployContracts();
  
    // Destructuring assignment from deployer
    ({ earthquakeInsurance, protectionNFT } = deployer);
  
    [owner, addr1, addr2] = await ethers.getSigners();
    zeroAddress = "0x0000000000000000000000000000000000000000";
  });

  it("1. Should correctly mint two tokens with ID 1 and 2 respectively", async function() {
    const buyer1 = await addr1.getAddress();
    const buyer2 = await addr2.getAddress();
  
    // Buy a policy for buyer1
    await earthquakeInsurance.connect(addr1).buyPolicy(zone, { value });
    // Assume the first token minted has tokenId 1
    const tokenId1 = 1;
    const tokenOwner1 = await protectionNFT.ownerOf(tokenId1);
    expect(tokenOwner1).to.equal(buyer1);
  
    // Buy a policy for buyer2
    await earthquakeInsurance.connect(addr2).buyPolicy(zone, { value });
    // Assume the second token minted has tokenId 2
    const tokenId2 = 2;
    const tokenOwner2 = await protectionNFT.ownerOf(tokenId2);
    expect(tokenOwner2).to.equal(buyer2);
  });

  it("2. Should fail when trying to buy a policy with 0 value", async function() {
    await expect(earthquakeInsurance.connect(addr1).buyPolicy(zone, { value: 0 }))
      .to.be.revertedWith("Policy cost must be greater than 0");
  });

  it("3. Should fail when trying to buy a policy in an affected zone", async function() {
    await earthquakeInsurance.connect(owner).setAffectedZone(zone);
    await expect(earthquakeInsurance.connect(addr1).buyPolicy(zone, { value }))
      .to.be.revertedWith("This zone is currently affected by an earthquake");
  });

  it("4. Should correctly mark a zone as affected", async function() {
    await earthquakeInsurance.connect(owner).setAffectedZone(zone);
    const isZoneAffected = await earthquakeInsurance.affectedZones(zone);

    expect(isZoneAffected).to.be.true;
  });

  it("5. Should fail when a non-owner tries to mark a zone as affected", async function() {
    await expect(earthquakeInsurance.connect(addr1).setAffectedZone(zone))
      .to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("6. Should correctly claim a payout", async function() {
    // Buy a policy and assume the first token minted has tokenId 1
    await earthquakeInsurance.connect(addr1).buyPolicy(zone, { value });
    const tokenId = 1;

    // Mark zone as affected and claim payout
    await earthquakeInsurance.connect(owner).setAffectedZone(zone);
    await earthquakeInsurance.connect(addr1).claimPayout(tokenId);

    // Token should no longer exist
    await expect(protectionNFT.ownerOf(tokenId))
      .to.be.revertedWith("ERC721: invalid token ID");
  });

  it("7. Should fail when a non-policy holder tries to claim a payout", async function() {
    // Buy a policy and assume the first token minted has tokenId 1
    await earthquakeInsurance.connect(addr1).buyPolicy(zone, { value });
    const tokenId = 1;

    // Mark zone as affected and try to claim payout with a different address
    await earthquakeInsurance.connect(owner).setAffectedZone(zone);
    await expect(earthquakeInsurance.connect(addr2).claimPayout(tokenId))
      .to.be.revertedWith("Not the holder of this policy");
  });

  it("8. Should fail when trying to claim a payout in a non-affected zone", async function() {
    // Buy a policy and assume the first token minted has tokenId 1
    await earthquakeInsurance.connect(addr1).buyPolicy(zone, { value });
    const tokenId = 1;

    // Try to claim payout without marking the zone as affected
    await expect(earthquakeInsurance.connect(addr1).claimPayout(tokenId))
      .to.be.revertedWith("Not within the affected area");
  });

});
