// SPDX-License-Identifier: MIT

pragma solidity ^0.8.12;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "erc721a/contracts/ERC721A.sol";
import "../interfaces/ICoBotsRenderer.sol";

contract OwnableDelegateProxy {}

contract ProxyRegistry {
    mapping(address => OwnableDelegateProxy) public proxies;
}

contract CoBots is ERC721A, Ownable, ReentrancyGuard {
    // Rendering contract
    address public renderingContractAddress;
    ICoBotsRenderer renderer;

    // Constants
    uint256 public constant MAX_COBOTS = 10_000;
    uint256 public constant MINT_PUBLIC_PRICE = 0.05 ether;
    uint8 public constant MAX_MINT_PER_BATCH = 32;

    // CoBots states variables
    uint8[10_000] public coBotsSeeds;
    bool[10_000] public coBotsStatusDisabled;
    bool[10_000] public coBotsColors;

    // Marketplaces
    address public opensea;
    address public looksrare;
    mapping(address => bool) proxyToApproved;

    /// @notice Set opensea to `opensea_`.
    function setOpensea(address opensea_) external onlyOwner {
        opensea = opensea_;
    }

    /// @notice Set looksrare to `looksrare_`.
    function setLooksrare(address looksrare_) external onlyOwner {
        looksrare = looksrare_;
    }

    /// @notice Approve the communication and interaction with cross-collection interactions.
    function flipProxyState(address proxyAddress) public onlyOwner {
        proxyToApproved[proxyAddress] = !proxyToApproved[proxyAddress];
    }

    /// @dev Modified for opensea and looksrare pre-approve.
    function isApprovedForAll(address owner, address operator)
        public
        view
        override(ERC721A)
        returns (bool)
    {
        return
            operator == address(ProxyRegistry(opensea).proxies(owner)) ||
            operator == looksrare ||
            proxyToApproved[operator] ||
            super.isApprovedForAll(owner, operator);
    }

    function setRenderingContractAddress(address _renderingContractAddress)
        public
        onlyOwner
    {
        renderingContractAddress = _renderingContractAddress;
        renderer = ICoBotsRenderer(renderingContractAddress);
    }

    constructor(
        string memory name_,
        string memory symbol_,
        address _rendererAddress,
        address _opensea,
        address _looksrare
    ) ERC721A(name_, symbol_) {
        setRenderingContractAddress(_rendererAddress);
        opensea = _opensea;
        looksrare = _looksrare;
    }

    function mint(uint256 quantity) external payable nonReentrant {
        require(
            quantity < MAX_MINT_PER_BATCH,
            "Too many CoBots to mint in one batch"
        );
        bytes32 seeds = keccak256(
            abi.encodePacked(
                quantity,
                msg.sender,
                msg.value,
                block.timestamp,
                block.difficulty
            )
        );
        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = _currentIndex + i;
            coBotsSeeds[tokenId] = uint8(seeds[i]);
            coBotsColors[tokenId] = tokenId % 2 == 0;
        }

        _safeMint(msg.sender, quantity);
    }

    function tokenURI(uint256 _tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        require(_exists(_tokenId), "ERC721: URI query for nonexistent token");

        if (renderingContractAddress == address(0)) {
            return "";
        }

        return
            renderer.tokenURI(
                _tokenId,
                coBotsSeeds[_tokenId],
                !coBotsStatusDisabled[_tokenId],
                coBotsColors[_tokenId]
            );
    }

    function exists(uint256 _tokenId) external view returns (bool) {
        return _exists(_tokenId);
    }

    receive() external payable {}

    function withdraw() public onlyOwner {
        (bool success, ) = _msgSender().call{value: address(this).balance}("");
        require(success, "Withdrawal failed");
    }
}
