import { ethers } from "hardhat";
import { expect } from "chai";
import { Contract, Signer } from "ethers";
import { Deployer } from "../scripts/deploy";

describe("EarthquakeInsurance", function () {
  let deployer: Deployer;
  let owner: Signer;
  let addr1: Signer;
  let addr2: Signer;

  beforeEach(async function () {
    deployer = new Deployer();
    await deployer.deployContracts();

    [owner, addr1, addr2] = await ethers.getSigners();
  });

  it("Should correctly mint the first token with ID 1", async function() {
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

  it("Should correctly mint the second token with ID 2", async function() {
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

  // More tests...
});
