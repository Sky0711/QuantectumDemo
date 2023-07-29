import { ethers } from 'hardhat';
import { expect } from 'chai';
import { Contract } from 'ethers';

describe('EarthquakeInsurance', function () {
  let EarthquakeInsurance: Contract;
  let owner: any;
  let addr1: any;
  let addr2: any;
  let addrs: any;

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    const EarthquakeInsuranceFactory = await ethers.getContractFactory("EarthquakeInsurance");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // Deploy a new contract instance for each test
    EarthquakeInsurance = await upgrades.deployProxy(EarthquakeInsuranceFactory, [], { initializer: 'initialize' });
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await EarthquakeInsurance.owner()).to.equal(owner.address);
    });
  });

  describe("Transactions", function () {
    it("Should allow a policy to be purchased", async function () {
      // Define the coverage amount and zone for the policy
      const coverageAmount = ethers.utils.parseEther("1");
      const zone = "Zone1";

      // Purchase a policy
      await EarthquakeInsurance.connect(addr1).buyPolicy(coverageAmount, zone, { value: ethers.utils.parseEther("1") });

      // Retrieve the policy
      const policy = await EarthquakeInsurance.policies(addr1.address);

      // Check that the policy's properties are correct
      expect(policy.policyHolder).to.equal(addr1.address);
      expect(policy.coverageAmount).to.equal(coverageAmount);
      expect(policy.isActive).to.equal(true);
      expect(policy.zone).to.equal(zone);
    });

    it("Should not allow a policy to be purchased if the zone is affected", async function () {
      // Define the coverage amount and zone for the policy
      const coverageAmount = ethers.utils.parseEther("1");
      const zone = "Zone1";

      // Set the zone as affected
      await EarthquakeInsurance.setAffectedZone(zone);

      // Try to purchase a policy
      await expect(EarthquakeInsurance.connect(addr1).buyPolicy(coverageAmount, zone, { value: ethers.utils.parseEther("1") })).to.be.revertedWith("This zone is currently affected by an earthquake");
    });

    it("Should allow a payout to be claimed if the zone is affected", async function () {
      // Define the coverage amount and zone for the policy
      const coverageAmount = ethers.utils.parseEther("1");
      const zone = "Zone1";

      // Purchase a policy
      await EarthquakeInsurance.connect(addr1).buyPolicy(coverageAmount, zone, { value: ethers.utils.parseEther("1") });

      // Set the zone as affected
      await EarthquakeInsurance.setAffectedZone(zone);

      // Claim a payout
      await EarthquakeInsurance.connect(addr1).claimPayout();

      // Retrieve the policy
      const policy = await EarthquakeInsurance.policies(addr1.address);

      // Check that the policy is inactive and the coverage amount is 0
      expect(policy.isActive).to.equal(false);
      expect(policy.coverageAmount).to.equal(0);
    });
  });
});
