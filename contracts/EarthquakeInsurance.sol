// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.3;

import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "./EarthquakeInsuranceDS.sol";

/**
 * @title EarthquakeInsurance
 * @dev The contract manages earthquake insurance policies and payouts.
 *      It allows users to buy policies and claim payouts if their zone is affected by an earthquake.
 */
contract EarthquakeInsurance is UUPSUpgradeable, OwnableUpgradeable, EarthquakeInsuranceDS {

    //////////////////////////// UUPS Functionalities  ////////////////////////////////////////
    // No constructor in upgradable contracts. Instead we have initializers
    function initialize() public initializer {
        __Ownable_init();
    }

    // Required by the OZ UUPS module (only owner is able to upgrade contract)
    function _authorizeUpgrade(address) internal override onlyOwner {}

    // Returns the Implementation Version
    function version() public pure returns (string memory) { return "EarthquakeInsurance: 0.1.0 Demo"; }

    //////////////////////////// Events ////////////////////////////////////////
    // TODO: Define events to be emitted by the contract

    //////////////////////////// Main Functionalities ////////////////////////////////////////

    /**
     * @notice Allows a policy holder to buy a policy.
     * @param _coverageAmount The amount of coverage for the policy.
     * @param _zone The zone where the policy holder is located.
     */
    function buyPolicy(uint256 _coverageAmount, string memory _zone) public payable {
        // Ensure the policy cost is greater than 0
        require(msg.value > 0, "Policy cost must be greater than 0");

        // Ensure the policy holder doesn't already have an active policy
        require(policies[msg.sender].isActive == false, "Policy already exists for this address");

        // Ensure the zone is not currently affected by an earthquake
        require(affectedZones[_zone] == false, "This zone is currently affected by an earthquake");

        // Create the policy and store it in the mapping
        policies[msg.sender] = Policy({
            policyHolder: msg.sender,
            coverageAmount: _coverageAmount,
            isActive: true,
            zone: _zone
        });
    }

    /**
     * @notice Allows an oracle or other trusted source to set a zone as affected by an earthquake.
     * @param _zone The zone to be marked as affected.
     */
    function setAffectedZone(string memory _zone) public {
        // Mark the zone as affected
        affectedZones[_zone] = true;
    }

    /**
     * @notice Allows a policy holder to claim a payout.
     */
    function claimPayout() public {
        // Ensure the policy holder has an active policy
        require(policies[msg.sender].isActive == true, "No active policy for this address");

        // Ensure the policy holder's zone is affected by an earthquake
        require(affectedZones[policies[msg.sender].zone] == true, "This policy is not within the affected area");

        // Calculate the payout amount
        uint256 payoutAmount = policies[msg.sender].coverageAmount;

        // Set the policy's coverage amount to 0 and mark it as inactive
        policies[msg.sender].coverageAmount = 0;
        policies[msg.sender].isActive = false;

        // Transfer the payout amount to the policy holder
        payable(msg.sender).transfer(payoutAmount);
    }
}
