// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.3;

import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "./EarthquakeInsuranceDS.sol";
import "./ProtectionNFT.sol";

/**
 * @title EarthquakeInsurance
 * @dev The contract manages Insurance policies and payouts.
 *      It allows users to buy policies and claim payouts if
 *      their location/zone is affected by an earthquake.
 */
contract EarthquakeInsurance is UUPSUpgradeable, OwnableUpgradeable, EarthquakeInsuranceDS {

    //////////////////////////// UUPS Functionalities  ////////////////////////////////////////
    // No constructor in upgradable contracts. Instead we have initializers
    function initialize(address _protectionNFTAddress) public initializer {
        __Ownable_init();
        
        // Setting address ProtectionNFT contract
        protectionNFT = ProtectionNFT(_protectionNFTAddress);
    }

    // Required by the OZ UUPS module (only owner is able to upgrade contract)
    function _authorizeUpgrade(address) internal override onlyOwner {}

    // Returns the Implementation Version
    function version() public pure returns (string memory) { return "EarthquakeInsurance: 0.1.0 Demo"; }

    //////////////////////////// Events ////////////////////////////////////////
    // TODO: Define events to be emitted by the contract

    //////////////////////////// Main Functionalities //////////////////////////

    /**
    * @notice Allows a policy holder to buy a policy.
    * @param _zone The zone where the policy holder is located.
    */
    function buyPolicy(string memory _zone) external payable {
        // Conditions checks
        require(msg.value > 0, "Policy cost must be greater than 0");
        require(affectedZones[_zone] == false, "This zone is currently affected by an earthquake");

        // Calculate the coverage amount
        uint256 coverageAmount = calculateCoverage(msg.value, _zone);

        // Create the coresponding Insurance policy
        InsurancePolicy memory policy = InsurancePolicy({
            coverageAmount: coverageAmount,
            zone: _zone
        });

        // After creating the policy, mint a new ProtectionNFT for the policy holder
        protectionNFT.mintProtectionNFT(msg.sender, policy);
    }

    /**
    * @notice Calculate coverage amount based on the amount paid and zone risk.
    * @param _amountPaid The amount paid by the policy holder.
    * _zone Geografical location where the policy holder is located.
    * @return coverageAmount equals payout for those affected.
    */
    function calculateCoverage(uint256 _amountPaid, string memory /*_zone*/)
    public pure returns (uint256) {
        // TODO: Here we would use some algorithm for riskAssesment
        // WIll use simple zoneRiskFactor = 1 for the DEMO
        uint zoneRiskFactor = 1;
        uint256 coverageAmount = _amountPaid * zoneRiskFactor;
        return coverageAmount;
    }

    /**
     * @notice Allows an Oracle or other trusted source to set a zone as affected by an earthquake.
     * @param _zone The zone to be marked as affected.
     */
    function setAffectedZone(string memory _zone) external onlyOwner(){
        // Mark the specified zone as affected by an earthquake
        affectedZones[_zone] = true;
    }

    /**
     * @notice Allows a policy holder to claim a payout if his location/zone is affected by an Earthquake.
     * @param _nftId The ID of the NFT that represents the policy.
     */
    function claimPayout(uint256 _nftId) external {
        // Fetch the properties of the NFT
        InsurancePolicy memory policy = protectionNFT.getNftProperties(_nftId);

        // Conditions checks
        require(protectionNFT.ownerOf(_nftId) == msg.sender, "Not the holder of this policy");
        require(affectedZones[policy.zone] == true, "Not within the affected area");

        // Remove Insurance Policy that was paied out
        protectionNFT.burnNFT(_nftId);

        // Transfer the payout amount to the policy holder
        payable(msg.sender).transfer(policy.coverageAmount);
    }


}
