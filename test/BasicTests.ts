import { ethers } from "hardhat";
import { expect } from "chai";
import { Contract, Signer } from "ethers";
import { Deployer } from "../scripts/deploy";

describe("EarthquakeInsurance", function () {
  let deployer: Deployer;
  let owner: Signer;
  let addr1: Signer;
  let addr2: Signer;
  let zeroAddress: string;

  beforeEach(async function () {
    deployer = new Deployer();
    await deployer.deployContracts();

    [owner, addr1, addr2] = await ethers.getSigners();
    zeroAddress = "0x0000000000000000000000000000000000000000";
  });

  it("1. Should correctly mint the first token with ID 1", async function() {
    const buyer = await addr1.getAddress();
    const zone = "Zone1";
    const value = ethers.utils.parseEther("1");

    // Buy a policy
    await deployer.earthquakeInsurance.connect(addr1).buyPolicy(zone, { value });

    // Assume the first token minted has tokenId 1
    const tokenId = 1;
    const tokenOwner = await deployer.protectionNFT.ownerOf(tokenId);

    expect(tokenOwner).to.equal(await addr1.getAddress());
  });

  it("2. Should correctly mint the second token with ID 2", async function() {
    const buyer1 = await addr1.getAddress();
    const buyer2 = await addr2.getAddress();
    const zone = "Zone1";
    const value = ethers.utils.parseEther("1");

    // Buy policies for two different buyers
    await deployer.earthquakeInsurance.connect(addr1).buyPolicy(zone, { value });
    await deployer.earthquakeInsurance.connect(addr2).buyPolicy(zone, { value });

    // Assume the second token minted has tokenId 2
    const tokenId = 2;
    const tokenOwner = await deployer.protectionNFT.ownerOf(tokenId);

    expect(tokenOwner).to.equal(await addr2.getAddress());
  });

  it("3. Should fail when trying to buy a policy with 0 value", async function() {
    const zone = "Zone1";
    await expect(deployer.earthquakeInsurance.connect(addr1).buyPolicy(zone, { value: 0 }))
      .to.be.revertedWith("Policy cost must be greater than 0");
  });

  it("4. Should fail when trying to buy a policy in an affected zone", async function() {
    const zone = "Zone1";
    const value = ethers.utils.parseEther("1");

    await deployer.earthquakeInsurance.connect(owner).setAffectedZone(zone);
    await expect(deployer.earthquakeInsurance.connect(addr1).buyPolicy(zone, { value }))
      .to.be.revertedWith("This zone is currently affected by an earthquake");
  });

  it("5. Should correctly mark a zone as affected", async function() {
    const zone = "Zone1";

    await deployer.earthquakeInsurance.connect(owner).setAffectedZone(zone);
    const isZoneAffected = await deployer.earthquakeInsurance.affectedZones(zone);

    expect(isZoneAffected).to.be.true;
  });

  it("6. Should fail when a non-owner tries to mark a zone as affected", async function() {
    const zone = "Zone1";

    await expect(deployer.earthquakeInsurance.connect(addr1).setAffectedZone(zone))
      .to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("7. Should correctly claim a payout", async function() {
    const zone = "Zone1";
    const value = ethers.utils.parseEther("1");

    // Buy a policy and assume the first token minted has tokenId 1
    await deployer.earthquakeInsurance.connect(addr1).buyPolicy(zone, { value });
    const tokenId = 1;

    // Mark zone as affected and claim payout
    await deployer.earthquakeInsurance.connect(owner).setAffectedZone(zone);
    await deployer.earthquakeInsurance.connect(addr1).claimPayout(tokenId);

    // Token should no longer exist
    await expect(deployer.protectionNFT.ownerOf(tokenId))
      .to.be.revertedWith("ERC721: invalid token ID");
  });

  it("8. Should fail when a non-policy holder tries to claim a payout", async function() {
    const zone = "Zone1";
    const value = ethers.utils.parseEther("1");

    // Buy a policy and assume the first token minted has tokenId 1
    await deployer.earthquakeInsurance.connect(addr1).buyPolicy(zone, { value });
    const tokenId = 1;

    // Mark zone as affected and try to claim payout with a different address
    await deployer.earthquakeInsurance.connect(owner).setAffectedZone(zone);
    await expect(deployer.earthquakeInsurance.connect(addr2).claimPayout(tokenId))
      .to.be.revertedWith("Not the holder of this policy");
  });

  it("9. Should fail when trying to claim a payout in a non-affected zone", async function() {
    const zone = "Zone1";
    const value = ethers.utils.parseEther("1");

    // Buy a policy and assume the first token minted has tokenId 1
    await deployer.earthquakeInsurance.connect(addr1).buyPolicy(zone, { value });
    const tokenId = 1;

    // Try to claim payout without marking the zone as affected
    await expect(deployer.earthquakeInsurance.connect(addr1).claimPayout(tokenId))
      .to.be.revertedWith("Not within the affected area");
  });

});
