import { ethers, upgrades } from "hardhat";
import { expect } from "chai";
import { Contract, Signer } from "ethers";

describe("EarthquakeInsurance", function () {
  let EarthquakeInsurance: Contract;
  let ProtectionNFT: Contract;
  let owner: Signer;
  let addr1: Signer;
  let addr2: Signer;

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    const EarthquakeInsuranceFactory = await ethers.getContractFactory("EarthquakeInsurance");
    const ProtectionNFTFactory = await ethers.getContractFactory("ProtectionNFT");
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy the ProtectionNFT contract with the UUPS proxy
    ProtectionNFT = await upgrades.deployProxy(ProtectionNFTFactory, [], { initializer: 'initialize' });
    await ProtectionNFT.deployed();

    // Deploy the EarthquakeInsurance contract with the UUPS proxy, passing the address of the ProtectionNFT contract to it
    EarthquakeInsurance = await upgrades.deployProxy(EarthquakeInsuranceFactory, [ProtectionNFT.address], { initializer: 'initialize' });
    await EarthquakeInsurance.deployed();

    // Set the EarthquakeInsurance address in the ProtectionNFT contract
    await ProtectionNFT.setEarthquakeInsurance(EarthquakeInsurance.address);
  });

  it("Should correctly mint the first token with ID 1", async function() {
    const buyer = await addr1.getAddress();
    const zone = "Zone1";
    const value = ethers.utils.parseEther("1");

    // Buy a policy
    await EarthquakeInsurance.connect(addr1).buyPolicy(zone, { value });

    // Assume the first token minted has tokenId 1
    const tokenId = 1;
    const tokenOwner = await ProtectionNFT.ownerOf(tokenId);

    expect(tokenOwner).to.equal(await addr1.getAddress());
  });

  it("Should correctly mint the second token with ID 2", async function() {
    const buyer1 = await addr1.getAddress();
    const buyer2 = await addr2.getAddress();
    const zone = "Zone1";
    const value = ethers.utils.parseEther("1");

    // Buy policies for two different buyers
    await EarthquakeInsurance.connect(addr1).buyPolicy(zone, { value });
    await EarthquakeInsurance.connect(addr2).buyPolicy(zone, { value });

    // Assume the second token minted has tokenId 2
    const tokenId = 2;
    const tokenOwner = await ProtectionNFT.ownerOf(tokenId);

    expect(tokenOwner).to.equal(await addr2.getAddress());
  });

  // More tests...
});
