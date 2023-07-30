// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.3;

import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "./InsurancePolicy.sol";

/**
 * @title ProtectionNFT_DS
 * @dev Abstract contract encapsulating data structures for ProtectionNFT.
 */
abstract contract ProtectionNFT_DS {

    // Constant
    bytes32 public constant VALID_CONTRACT = keccak256("VALID_CONTRACT");

    ////////// Counter utility library ////////////////////////
    CountersUpgradeable.Counter internal _tokenIdTracker;

    // Address of EarthquakeInsurance contract
    address EarthquakeInsurance;

    // Storing NFT details for each NFT (tokenId => NFTDetails)
    mapping(uint256 => InsurancePolicy) internal nftDetails;
}
