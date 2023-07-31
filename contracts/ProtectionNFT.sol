// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.3;

import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "./ProtectionNFT_DS.sol";

/**
 * @title ProtectionNFT
 * @dev The contract manages Insurance NFTs.
 */
contract ProtectionNFT is UUPSUpgradeable, ERC721Upgradeable, AccessControlUpgradeable, ProtectionNFT_DS {
    //////////////////////////// UUPS Functionalities ////////////////////////////////////////
    ///@dev No constructor in upgradable contracts. Instead we have initializers
    function initialize() public initializer {
        __ERC721_init("ProtectionNFT", "PNFT");

        // Grant the contract deployer the DEFAULT_ADMIN_ROLE
        _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());
    }

    // Setting address for EarthquakeInsurance contract
    function setEarthquakeInsurance( address contractAddress) external onlyRole(DEFAULT_ADMIN_ROLE) {
        EarthquakeInsurance = contractAddress;

        // Granting VALID_CONTRACT role to EarthquakeInsurance smart contract,
        // allowing it to mint and burn NFTs.
        _grantRole(VALID_CONTRACT, contractAddress);
    }

    ///@dev Required by the OZ UUPS module (Only contract owner can initiate upgrade)
    function _authorizeUpgrade(address) internal override onlyRole(DEFAULT_ADMIN_ROLE) {}

        // Returns the Implementation Version
    function version() public pure returns (string memory) { return "ProtectionNFT: 0.1.0 Demo"; }

    ////////// Counter utility library ////////////////////////
    using CountersUpgradeable for CountersUpgradeable.Counter; 

    //////////////////////////// Events ////////////////////////////////////////
    // TODO: Define events to be emitted by the contract

    //////////////////////////// Main Functionalities ////////////////////////////////////////

    /**
    * @notice Mint a new ProtectionNFT.
    * @dev Only VALID_CONTRACT can mint new tokens.
    * @param _policy The policy details.
    */
    function mintProtectionNFT(address recipient, InsurancePolicy memory _policy)
    external onlyRole(VALID_CONTRACT) returns (uint){
        // Get tokenId
        _tokenIdTracker.increment();
        uint256 tokenId = _tokenIdTracker.current();

        // Mint ProtectionNFT
        _mint(recipient, tokenId);
        nftDetails[tokenId] = _policy;

        return tokenId;
    }

    /**
    * @notice Retrieve the insurance policy details of a given NFT.
    * @dev Only an entity with the VALID_CONTRACT role can call this function.
    * @param tokenId The ID of the NFT.
    * @return The insurance policy associated with the NFT.
    */
    function getNftProperties(uint tokenId) external view onlyRole(VALID_CONTRACT) returns(InsurancePolicy memory){
        return nftDetails[tokenId];
    }

    /**
    * @notice Burn a given NFT and delete its associated insurance policy.
    * @dev Only an entity with the VALID_CONTRACT role can call this function. The caller must also be the NFT owner or an approved address.
    * @param tokenId The ID of the NFT to be burned.
    */
    function burnNFT(address owner, uint256 tokenId) external onlyRole(VALID_CONTRACT) {
        // Check that the message sender is the owner of the token
        require(_isApprovedOrOwner(owner, tokenId), "Caller is not owner or approved");

        // Deletes the NFT and associated InsurancePolicy
        _burn(tokenId);
        delete nftDetails[tokenId];
    }
    /**
     * ERC165 proxy method.
     *
     * For details see https://forum.openzeppelin.com/t/derived-contract-must-override-function-supportsinterface/6315/2.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override
    (ERC721Upgradeable, AccessControlUpgradeable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
