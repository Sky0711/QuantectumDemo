// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.3;

/**
 * @title EarthquakeInsuranceDS
 * @dev Abstract contract encapsulating data structures for EarthquakeInsurance.
 */
abstract contract EarthquakeInsuranceDS {

    // Struct encapsulating all relevant attributes of an insurance policy
    struct Policy {
        address policyHolder;     // Ethereum address of the policy holder
        uint256 coverageAmount;   // Amount of coverage the policy provides
        bool isActive;            // Status of the policy: active or not
        string zone;              // Geographical zone where the policy holder is located
    }

    // Mapping tracking earthquake-affected zones (zone => isAffected)
    mapping(string => bool) public affectedZones;

    // Mapping storing insurance policies for each policy holder (policyHolder => Policy)
    mapping(address => Policy) public policies;
}
