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
    function initialize(string memory _name, string memory _symbol) public initializer {
        __ERC721_init(_name, _symbol);

        // Grant the contract deployer the DEFAULT_ADMIN_ROLE
        _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());
    }

    ///@dev Required by the OZ UUPS module (Only contract owner can initiate upgrade)
    function _authorizeUpgrade(address) internal override onlyRole(DEFAULT_ADMIN_ROLE) {}

    ////////// Counter utility library ////////////////////////
    using CountersUpgradeable for CountersUpgradeable.Counter; 
    
    //////////////////////////// Events ////////////////////////////////////////
    // TODO: Define events to be emitted by the contract

    //////////////////////////// Main Functionalities ////////////////////////////////////////

    /**
     * @notice Mint a new ProtectionNFT.
     * @dev Only accounts with the DEFAULT_ADMIN_ROLE can mint new tokens.
     * @param recipient The address to receive the newly minted token.
     */
    function mintProtectionNFT(address recipient) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _tokenIdTracker.increment();
        _mint(recipient, _tokenIdTracker.current());
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
