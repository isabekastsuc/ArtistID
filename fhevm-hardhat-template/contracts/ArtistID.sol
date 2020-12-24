// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, euint64, euint256, ebool, externalEuint32, externalEuint64, externalEuint256} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title ArtistID – 艺术家身份认证（FHEVM + ERC721）
/// @notice 单地址一次注册，NFT 作为认证凭证；使用 FHEVM 加密计数与签名计量作为示例，展示 FHE 运算与解密授权
contract ArtistID is ERC721, Ownable, SepoliaConfig {
    struct ArtistProfile {
        string name;
        string bio;
        string portfolioURI;  // IPFS CID 或 URI（代表作/封面/作品集）
        string category;      // painter / musician / photographer / etc.
        uint256 createdAt;
        address wallet;
    }

    /// @dev address -> 已注册
    mapping(address => bool) public registered;
    /// @dev address -> tokenId
    mapping(address => uint256) public tokenIdOf;
    /// @dev tokenId -> profile
    mapping(uint256 => ArtistProfile) internal _profiles;

