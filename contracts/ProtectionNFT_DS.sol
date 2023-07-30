// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.3;

import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";

/**
 * @title ProtectionNFT_DS
 * @dev Abstract contract encapsulating data structures for ProtectionNFT.
 */
abstract contract ProtectionNFT_DS {

    // Constants 
    // bytes32 public constant DEFAULT_ADMIN_ROLE = keccak256("DEFAULT_ADMIN_ROLE");

    ////////// Counter utility library ////////////////////////
    CountersUpgradeable.Counter public _tokenIdTracker;

    // Struct encapsulating all relevant attributes of a Protection NFT
    struct ProtectionNFTDetails {
        address owner;            // Address of the NFT owner
        uint256 coverageAmount;   // Amount of coverage the NFT provides
        bool isActive;            // Status of the NFT: active or not
        string zone;              // Geographical zone the NFT is covering
    }

    // Storing NFT details for each NFT (tokenId => NFTDetails)
    mapping(uint256 => ProtectionNFTDetails) public nftDetails;
}
