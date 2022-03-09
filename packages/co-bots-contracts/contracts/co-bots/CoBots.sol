// SPDX-License-Identifier: MIT

pragma solidity ^0.8.12;

import "@chainlink/contracts/src/v0.8/interfaces/LinkTokenInterface.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "erc721a/contracts/ERC721A.sol";
import "../interfaces/ICoBotsRenderer.sol";

contract OwnableDelegateProxy {}

contract ProxyRegistry {
    mapping(address => OwnableDelegateProxy) public proxies;
}

contract CoBots is ERC721A, VRFConsumerBaseV2, Ownable, ReentrancyGuard {
    // Constants
    uint256 public constant MAX_COBOTS = 10_000;
    uint256 public constant MINT_PUBLIC_PRICE = 0.05 ether;
    uint8 public constant MAX_MINT_PER_ADDRESS = 20;
    uint8 public constant MINT_GIVEAWAYS = 30;
    uint8 public constant MINT_FOUNDERS_AND_GIVEAWAYS = 50;
    uint256 public constant COBOTS_MINT_DURATION = 168 hours;
    uint256 public constant COBOTS_MINT_RAFFLE_DELAY = 1 days;
    uint256 public constant COBOTS_REFUND_DURATION = 168 hours;
    uint256 public constant RAFFLE_DRAW_DELAY = 1 minutes;
    uint256 public constant MAIN_RAFFLE_PRIZE = 25 ether;
    uint8 public constant MAIN_RAFFLE_WINNERS_COUNT = 10;
    uint256 public constant COORDINATION_RAFFLE_PRIZE = 2.5 ether;
    uint8 public constant COORDINATION_RAFFLE_WINNERS_COUNT = 20;
    uint16 public constant COORDINATION_RAFFLE_THRESHOLD = 9_500;

    // CoBots states variables
    uint8[10_000] public coBotsSeeds;
    bool[10_000] public coBotsStatusDisabled;
    bool[10_000] public coBotsColors;
    bool[10_000] public coBotsRefunded;
    uint16 public coBotsColorAgreement = 5000; // cobots are minted 50%/50%

    ////////////////////////////////////////////////////////////////////////
    ////////////////////////// Schedule ////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////
    uint256 public publicSaleStartTimestamp;

    function setPublicSaleTimestamp(uint256 timestamp) external onlyOwner {
        publicSaleStartTimestamp = timestamp;
    }

    function isPublicSaleOpen() public view returns (bool) {
        return
            block.timestamp > publicSaleStartTimestamp &&
            publicSaleStartTimestamp != 0 &&
            block.timestamp < publicSaleStartTimestamp + COBOTS_MINT_DURATION;
    }

    modifier whenPublicSaleOpen() {
        require(isPublicSaleOpen(), "Public sale not open");
        _;
    }

    modifier whenPublicSaleClosed() {
        require(!isPublicSaleOpen(), "Public sale open");
        _;
    }

    function isMintedOut() public view returns (bool) {
        return _currentIndex == MAX_COBOTS;
    }

    modifier whenMintedOut() {
        require(isMintedOut(), "Co-Bots are not minted out");
        _;
    }

    modifier whenNotMintedOut() {
        require(!isMintedOut(), "Co-Bots are minted out");
        _;
    }

    ////////////////////////////////////////////////////////////////////////
    ////////////////////////// Marketplaces ////////////////////////////////
    ////////////////////////////////////////////////////////////////////////
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

    ////////////////////////////////////////////////////////////////////////
    ////////////////////////// Token ///////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////
    address public renderingContractAddress;
    ICoBotsRenderer renderer;

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
        address _looksrare,
        address vrfCoordinator,
        address link,
        bytes32 keyHash
    ) ERC721A(name_, symbol_) VRFConsumerBaseV2(vrfCoordinator) {
        setRenderingContractAddress(_rendererAddress);
        opensea = _opensea;
        looksrare = _looksrare;
        COORDINATOR = VRFCoordinatorV2Interface(vrfCoordinator);
        LINKTOKEN = LinkTokenInterface(link);
        gasKeyHash = keyHash;
    }

    function _mint(address to, uint256 quantity) internal {
        require(quantity < 32, "Too many Co-Bots to mint in one batch");
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

        _safeMint(to, quantity);
    }

    function mintPublicSale(uint256 quantity)
        external
        payable
        whenPublicSaleOpen
        nonReentrant
    {
        require(
            msg.value == MINT_PUBLIC_PRICE * quantity,
            "Price does not match"
        );
        require(
            _currentIndex + quantity < MAX_COBOTS + 1,
            "There are not enough Co-Bots left to mint that amount"
        );
        require(
            ERC721A.balanceOf(_msgSender()) + quantity <= MAX_MINT_PER_ADDRESS,
            "Co-Bots: the requested quantity exceeds the maximum allowed"
        );

        _mint(_msgSender(), quantity);
    }

    function mintFoundersAndGiveaways(address to, uint256 quantity)
        external
        onlyOwner
    {
        require(
            quantity + _currentIndex <= MINT_FOUNDERS_AND_GIVEAWAYS,
            "Quantity exceeds founders and giveaways allowance"
        );

        _mint(to, quantity);
    }

    function updateCooperativeRaffleStatus() internal {
        if (
            publicSaleStartTimestamp +
                COBOTS_MINT_DURATION +
                COBOTS_MINT_RAFFLE_DELAY >
            block.timestamp &&
            ((coBotsColorAgreement >= COORDINATION_RAFFLE_THRESHOLD) ||
                (coBotsColorAgreement <=
                    MAX_COBOTS - COORDINATION_RAFFLE_THRESHOLD))
        ) {
            cooperativeRaffleEnabled = true;
        }
    }

    function toggleColor(uint256 tokenId) external nonReentrant {
        require(
            ERC721A.ownerOf(tokenId) == _msgSender(),
            "Only owner can toggle color"
        );

        coBotsColors[tokenId] = !coBotsColors[tokenId];
        unchecked {
            coBotsColorAgreement = coBotsColors[tokenId]
                ? coBotsColorAgreement + 1
                : coBotsColorAgreement - 1;
        }
        updateCooperativeRaffleStatus();
    }

    function toggleColors(uint256[] calldata tokenIds) external nonReentrant {
        bool commonColor = coBotsColors[tokenIds[0]];
        for (uint256 i = 0; i < tokenIds.length; i++) {
            require(
                ERC721A.ownerOf(tokenIds[i]) == _msgSender(),
                "Only owner can toggle color"
            );
            require(
                commonColor == coBotsColors[tokenIds[i]],
                "Toggling colors in two different colors!"
            );
            coBotsColors[tokenIds[i]] = !coBotsColors[tokenIds[i]];
        }
        unchecked {
            coBotsColorAgreement = commonColor
                ? coBotsColorAgreement + uint16(tokenIds.length)
                : coBotsColorAgreement - uint16(tokenIds.length);
        }
        updateCooperativeRaffleStatus();
    }

    function toggleStatus(uint256 tokenId) public nonReentrant {
        require(
            ERC721A.ownerOf(tokenId) == _msgSender(),
            "Only owner can toggle status"
        );

        coBotsStatusDisabled[tokenId] = !coBotsStatusDisabled[tokenId];
    }

    function toggleStatuses(uint256[] calldata tokenIds) public nonReentrant {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            toggleStatus(tokenIds[i]);
        }
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
        require(
            drawCount ==
                (
                    cooperativeRaffleEnabled
                        ? MAIN_RAFFLE_WINNERS_COUNT +
                            COORDINATION_RAFFLE_WINNERS_COUNT
                        : MAIN_RAFFLE_WINNERS_COUNT
                ) ||
                (block.timestamp >
                    publicSaleStartTimestamp +
                        COBOTS_MINT_DURATION +
                        COBOTS_REFUND_DURATION),
            "Dev cannot withdraw before the end of the game"
        );
        (bool success, ) = _msgSender().call{value: address(this).balance}("");
        require(success, "Withdrawal failed");
    }

    ////////////////////////////////////////////////////////////////////////
    ////////////////////////// Raffle //////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////
    VRFCoordinatorV2Interface COORDINATOR;
    LinkTokenInterface LINKTOKEN;
    bytes32 gasKeyHash;

    uint256 public lastDrawTimestamp;
    uint64 private s_subId;
    mapping(address => uint256) public prizePerAddress;
    mapping(uint256 => uint256) public prizePerDraw;
    uint16 public drawCount;
    bool public cooperativeRaffleEnabled;

    function isDrawOpen() public view returns (bool) {
        return
            !isPublicSaleOpen() &&
            block.timestamp >
            publicSaleStartTimestamp +
                COBOTS_MINT_DURATION +
                COBOTS_MINT_RAFFLE_DELAY;
    }

    modifier whenDrawOpen() {
        require(isDrawOpen(), "Draw not active");
        _;
    }

    modifier whenRefundAllowed() {
        require(
            (block.timestamp >
                publicSaleStartTimestamp + COBOTS_MINT_DURATION) &&
                (block.timestamp <
                    publicSaleStartTimestamp +
                        COBOTS_MINT_DURATION +
                        COBOTS_REFUND_DURATION),
            "Refund period not open"
        );
        _;
    }

    function claimRefund()
        external
        nonReentrant
        whenRefundAllowed
        whenNotMintedOut
    {
        uint256 value;
        for (uint256 i = 0; i < ERC721A.balanceOf(_msgSender()); i++) {
            uint256 tokenId = ERC721A.tokenOfOwnerByIndex(_msgSender(), i);
            if (tokenId < MINT_FOUNDERS_AND_GIVEAWAYS) {
                continue;
            }
            if (!coBotsRefunded[tokenId]) {
                value += MINT_PUBLIC_PRICE;
                coBotsRefunded[tokenId] = true;
            }
        }
        require(value > 0, "No Co-Bots to refund");
        (bool success, ) = _msgSender().call{value: value}("");
        require(success, "Withdrawal failed");
    }

    function claimRefund(uint256[] calldata tokenIds)
        external
        nonReentrant
        whenRefundAllowed
        whenNotMintedOut
    {
        uint256 value;
        for (uint256 i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            if (tokenId < MINT_FOUNDERS_AND_GIVEAWAYS) {
                continue;
            }
            require(
                ERC721A.ownerOf(tokenId) == _msgSender(),
                "You cannot claim a refund for a token you do not own"
            );
            if (!coBotsRefunded[tokenId]) {
                value += MINT_PUBLIC_PRICE;
                coBotsRefunded[tokenId] = true;
            }
        }
        require(value > 0, "No Co-Bots to refund");
        (bool success, ) = _msgSender().call{value: value}("");
        require(success, "Withdrawal failed");
    }

    function createSubscriptionAndFund(uint96 amount) external onlyOwner {
        if (s_subId == 0) {
            s_subId = COORDINATOR.createSubscription();
            COORDINATOR.addConsumer(s_subId, address(this));
        }
        LINKTOKEN.transferAndCall(
            address(COORDINATOR),
            amount,
            abi.encode(s_subId)
        );
    }

    function draw()
        external
        nonReentrant
        whenDrawOpen
        whenMintedOut
        returns (uint256)
    {
        require(
            drawCount <
                (
                    cooperativeRaffleEnabled
                        ? MAIN_RAFFLE_WINNERS_COUNT +
                            COORDINATION_RAFFLE_WINNERS_COUNT
                        : MAIN_RAFFLE_WINNERS_COUNT
                ),
            "Draw limit reached"
        );
        require(
            (lastDrawTimestamp + RAFFLE_DRAW_DELAY <= block.timestamp) ||
                drawCount == 0,
            "Draws take place once per minute"
        );
        lastDrawTimestamp = block.timestamp;
        uint256 currentPrizeMoney = drawCount < MAIN_RAFFLE_WINNERS_COUNT
            ? MAIN_RAFFLE_PRIZE
            : COORDINATION_RAFFLE_PRIZE;
        drawCount++;
        uint256 requestId = COORDINATOR.requestRandomWords(
            gasKeyHash,
            s_subId,
            5, // requestConfirmations
            500_000, // callbackGasLimit
            1 // numWords
        );
        prizePerDraw[requestId] = currentPrizeMoney;
        return requestId;
    }

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords)
        internal
        override
    {
        uint256 selectedToken = randomWords[0];
        address winner = ERC721A.ownerOf(selectedToken % 10_000);
        while (
            prizePerAddress[winner] > 0 ||
            (selectedToken % 10_000 >= MINT_GIVEAWAYS &&
                selectedToken % 10_000 < MINT_FOUNDERS_AND_GIVEAWAYS)
        ) {
            selectedToken = selectedToken >> 1;
            winner = ERC721A.ownerOf(selectedToken % 10_000);
        }
        prizePerAddress[winner] = prizePerDraw[requestId];
        (bool success, ) = winner.call{value: prizePerDraw[requestId]}("");
        require(success, "Transfer failed.");
    }
}
