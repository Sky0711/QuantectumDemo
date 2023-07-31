   // SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.3;

   
// Struct encapsulating all relevant attributes of a Protection NFT
struct InsurancePolicy {
    uint256 coverageAmount;   // Amount of coverage the NFT provides
    string zone;              // Geographical zone the NFT is covering
}