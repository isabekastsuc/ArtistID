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

    /// @dev 全局计数：使用 FHE 加密存储，演示链上同态运算（如注册数、验证通过次数等）
    euint32 private _encryptedTotalArtists;

    /// @dev 每位艺术家一个“加密积分”示例（如认证强度），展示 allow/解密与加法
    mapping(uint256 => euint32) private _encryptedReputationOf;

    uint256 public totalArtists; // 明文计数（辅助索引）

    event ArtistRegistered(address indexed artist, uint256 tokenId);

    constructor() ERC721("ArtistID", "AID") Ownable(msg.sender) {}

    // ------------------------------------------------------------
    // 注册与资料
    // ------------------------------------------------------------
    function registerArtist(
        string memory name_,
        string memory bio_,
        string memory portfolioURI_,
        string memory category_
    ) external returns (uint256 tokenId) {
        require(!registered[msg.sender], "Already registered");

        tokenId = ++totalArtists;
        registered[msg.sender] = true;
        tokenIdOf[msg.sender] = tokenId;

        _safeMint(msg.sender, tokenId);

        _profiles[tokenId] = ArtistProfile({
            name: name_,
            bio: bio_,
            portfolioURI: portfolioURI_,
            category: category_,
            createdAt: block.timestamp,
            wallet: msg.sender
        });

        // 初始化艺术家“加密积分”为 0，并授权给合约与调用者
        _encryptedReputationOf[tokenId] = FHE.asEuint32(0);
        FHE.allowThis(_encryptedReputationOf[tokenId]);
        FHE.allow(_encryptedReputationOf[tokenId], msg.sender);

        // 全局加密计数 +1（演示同态加法 + 标量）
        _encryptedTotalArtists = FHE.add(_encryptedTotalArtists, 1);
        FHE.allowThis(_encryptedTotalArtists);

        emit ArtistRegistered(msg.sender, tokenId);
    }

    function getArtistProfile(address user) external view returns (ArtistProfile memory) {
        uint256 tokenId = tokenIdOf[user];
        require(tokenId != 0, "Not registered");
        return _profiles[tokenId];
    }

    function tokenProfile(uint256 tokenId) external view returns (ArtistProfile memory) {
        require(_ownerOf(tokenId) != address(0), "Invalid tokenId");
        return _profiles[tokenId];
    }

    function isArtist(address user) external view returns (bool) {
        return registered[user];
    }

    // ------------------------------------------------------------
    // FHE 示例：加密积分增减（外部密文输入 + 证明）
    // ------------------------------------------------------------
    function addReputation(
        uint256 tokenId,
        externalEuint32 valueHandle,
        bytes calldata inputProof
    ) external {
        require(_ownerOf(tokenId) != address(0), "Invalid tokenId");
        require(ownerOf(tokenId) == msg.sender, "Only owner");

        euint32 v = FHE.fromExternal(valueHandle, inputProof);
        _encryptedReputationOf[tokenId] = FHE.add(_encryptedReputationOf[tokenId], v);

        // 授权合约和调用者可解密当前值（示例）
        FHE.allowThis(_encryptedReputationOf[tokenId]);
        FHE.allow(_encryptedReputationOf[tokenId], msg.sender);
    }

    function subReputation(
        uint256 tokenId,
        externalEuint32 valueHandle,
        bytes calldata inputProof
    ) external {
        require(_ownerOf(tokenId) != address(0), "Invalid tokenId");
        require(ownerOf(tokenId) == msg.sender, "Only owner");

        euint32 v = FHE.fromExternal(valueHandle, inputProof);
        _encryptedReputationOf[tokenId] = FHE.sub(_encryptedReputationOf[tokenId], v);

        FHE.allowThis(_encryptedReputationOf[tokenId]);
        FHE.allow(_encryptedReputationOf[tokenId], msg.sender);
    }

    /// @notice 返回加密的总艺术家数（供前端用户解密或公共解密）
    function getEncryptedTotalArtists() external view returns (euint32) {
        return _encryptedTotalArtists;
    }

    /// @notice 返回某艺术家的加密积分（供前端用户解密）
    function getEncryptedReputation(uint256 tokenId) external view returns (euint32) {
        require(_ownerOf(tokenId) != address(0), "Invalid tokenId");
        return _encryptedReputationOf[tokenId];
    }
}


