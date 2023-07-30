// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.3;

import "./ProtectionNFT.sol";
import "./InsurancePolicy.sol";

/**
 * @title EarthquakeInsuranceDS
 * @dev Abstract contract encapsulating data structures for EarthquakeInsurance.
 */
abstract contract EarthquakeInsuranceDS {

    // Address of ProtectionNFT contract
    ProtectionNFT internal protectionNFT;

    // Tracking earthquake-affected Geografical zones (zone => isAffected)
    mapping(string => bool) public affectedZones;

    // Storing insurance policies for each policy holder (policyHolder => Policy)
    mapping(address => InsurancePolicy) public policies;
}
