// SPDX-License-Identifier: MIT

pragma solidity ^0.8.12;

import "@chainlink/contracts/src/v0.8/interfaces/LinkTokenInterface.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "erc721a/contracts/ERC721A.sol";
import "../interfaces/ICoBotsRendererV2.sol";
import "./Schedule.sol";

error BatchLimitExceeded();
error WrongPrice();
error TotalSupplyExceeded();
error AllocationExceeded();
error ToggleMettaCallerNotOwner();
error ChainlinkSubscriptionNotFound();
error TransferFailed();
error MysteryChallengeSenderDoesNotOwnENS();
error MysteryChallengeValueDoesNotMatch();
error MysteryChallengeSenderDoesNotOwnToken();
error FulfillmentAlreadyFulfilled();
error FulfillRequestForNonExistentContest();
error RedeemTokenNotOwner();
error RedeemTokenAlreadyRedeemed();
error NoGiveawayToTrigger();

contract CoBotsV2 is
    ERC721A,
    VRFConsumerBaseV2,
    Ownable,
    ReentrancyGuard,
    Schedule
{
    // Events
    event RendererContractUpdated(address indexed renderer);

    // Data structures
    struct Prize {
        uint16 checkpoint;
        uint72 amount;
        bool isContest;
    }

    struct MysteryChallenge {
        uint256 ensId;
        uint256 value;
        uint8 prizeIndex;
    }

    struct Parameters {
        uint8 cobotsV1Discount;
        uint16 mintOutFoundersWithdrawalDelay;
        uint16 grandPrizeDelay;
        uint16 maxCobots;
        uint24 contestDuration;
        uint72 mintPublicPrice;
    }

    // Constants
    uint8 public constant MINT_FOUNDERS = 3;
    uint8 public constant MINT_BATCH_LIMIT = 32;
    Parameters public PARAMETERS;
    Prize[] public PRIZES;
    MysteryChallenge private MYSTERY_CHALLENGE;
    IERC721 ENS;
    IERC721 COBOTS_V1;

    ////////////////////////////////////////////////////////////////////////
    ////////////////////////// Token ///////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////

    address public renderingContractAddress;
    ICoBotsRendererV2 public renderer;
    uint8[] public coBotsSeeds;
    mapping(uint256 => bool) public coBotsV1Redeemed;

    function setRenderingContractAddress(address _renderingContractAddress)
        public
        onlyOwner
    {
        renderingContractAddress = _renderingContractAddress;
        renderer = ICoBotsRendererV2(renderingContractAddress);
        emit RendererContractUpdated(renderingContractAddress);
    }

    constructor(
        string memory name_,
        string memory symbol_,
        address _rendererAddress,
        address vrfCoordinator,
        address link,
        bytes32 keyHash,
        Parameters memory _parameters,
        Prize[] memory _prizes,
        address ens,
        address cobotsV1,
        MysteryChallenge memory _mysteryChallenge
    ) ERC721A(name_, symbol_) VRFConsumerBaseV2(vrfCoordinator) {
        setRenderingContractAddress(_rendererAddress);
        COORDINATOR = VRFCoordinatorV2Interface(vrfCoordinator);
        LINKTOKEN = LinkTokenInterface(link);
        gasKeyHash = keyHash;
        PARAMETERS = _parameters;
        for (uint256 i = 0; i < _prizes.length; i++) {
            PRIZES.push(_prizes[i]);
        }
        ENS = IERC721(ens);
        COBOTS_V1 = IERC721(cobotsV1);
        MYSTERY_CHALLENGE = _mysteryChallenge;
    }

    function _mintCoBots(address to, uint256 quantity) internal {
        if (quantity > MINT_BATCH_LIMIT) revert BatchLimitExceeded();
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
            coBotsSeeds.push(uint8(seeds[i]) << 1); // insure last digit is 0, used for Metta status
        }

        ERC721A._safeMint(to, quantity);
    }

    /**
     * Mints a batch of Co-Bots to the sender.
     *
     * @dev The tokenIdsV1 parameter can be empty. The call will revert only if the sender pretends to own some
     *      Co-Bots V1 that they actually don't. However it accepts already redeemed token and just ignore them silently.
     *      This is to make it easier for people using etherscan to copy a bunch of token Ids without having to
     *      manually check if they are redeemed or not. However, it is optimal in terms of gas fees to only give
     *      tokenIds if they can actually be redeemed.
     * @param quantity The number of COBOTS to mint.
     * @param tokenIdsV1 A list of V1 Co-Bots token Ids owned by the sender, used to determine the discount.
     */
    function mintPublicSale(uint256 quantity, uint256[] memory tokenIdsV1)
        external
        payable
        whenPublicSaleOpen
        nonReentrant
    {
        if (_currentIndex + quantity > PARAMETERS.maxCobots)
            revert TotalSupplyExceeded();
        uint256 price = PARAMETERS.mintPublicPrice * quantity;
        uint256 redeemed = 0;
        for (uint256 i = 0; i < tokenIdsV1.length; i++) {
            if (COBOTS_V1.ownerOf(tokenIdsV1[i]) != _msgSender())
                revert RedeemTokenNotOwner();
            if (!coBotsV1Redeemed[tokenIdsV1[i]] && redeemed < quantity) {
                coBotsV1Redeemed[tokenIdsV1[i]] = true;
                redeemed++;
                price -=
                    PARAMETERS.mintPublicPrice *
                    (1 - 1 / PARAMETERS.cobotsV1Discount);
            }
        }
        if (msg.value != price) revert WrongPrice();
        if (quantity + _currentIndex == PARAMETERS.maxCobots) {
            mintedOutTimestamp = block.timestamp;
        }

        _mintCoBots(_msgSender(), quantity);
    }

    function mintFounders(address to, uint256 quantity) external onlyOwner {
        if (quantity + _currentIndex > MINT_FOUNDERS)
            revert AllocationExceeded();

        _mintCoBots(to, quantity);
    }

    /** @notice Return true if the Co-Bot displays metta screen
     *   @param tokenId The Co-Bot token ID
     */
    function isMettaEnabled(uint256 tokenId) external view returns (bool) {
        return coBotsSeeds[tokenId] & 1 == 1;
    }

    function toggleMetta(uint256 tokenId) public nonReentrant {
        if (ERC721A.ownerOf(tokenId) != _msgSender())
            revert ToggleMettaCallerNotOwner();

        coBotsSeeds[tokenId] = coBotsSeeds[tokenId] ^ 1;
    }

    function toggleMetta(uint256[] calldata tokenIds) public nonReentrant {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            toggleMetta(tokenIds[i]);
        }
    }

    function tokenURI(uint256 _tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        if (!_exists(_tokenId)) revert URIQueryForNonexistentToken();

        if (renderingContractAddress == address(0)) {
            return "";
        }

        return renderer.tokenURI(_tokenId, coBotsSeeds[_tokenId]);
    }

    function exists(uint256 _tokenId) external view returns (bool) {
        return _exists(_tokenId);
    }

    receive() external payable {}

    ////////////////////////////////////////////////////////////////////////
    ////////////////////////// Raffle //////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////
    VRFCoordinatorV2Interface COORDINATOR;
    LinkTokenInterface LINKTOKEN;
    bytes32 gasKeyHash;
    uint64 public chainlinkSubscriptionId;

    struct Winner {
        address winner;
        uint16 tokenId;
    }

    struct Fulfillment {
        Prize prize;
        bool fulfilled;
    }

    mapping(uint256 => Fulfillment) public fulfillments;
    Winner[] public winners;
    uint8 drawCounts;

    function createSubscriptionAndFund(uint96 amount) external onlyOwner {
        if (chainlinkSubscriptionId == 0) {
            chainlinkSubscriptionId = COORDINATOR.createSubscription();
            COORDINATOR.addConsumer(chainlinkSubscriptionId, address(this));
        }
        LINKTOKEN.transferAndCall(
            address(COORDINATOR),
            amount,
            abi.encode(chainlinkSubscriptionId)
        );
    }

    function cancelSubscription() external onlyOwner {
        COORDINATOR.cancelSubscription(chainlinkSubscriptionId, _msgSender());
        chainlinkSubscriptionId = 0;
    }

    /**
     * @notice This function can be called at any time by anyone to trigger the unlocked giveaways. It will
     *         revert if there is nothing to unlock to prevent anon from making useless tx. (Usually wallet, e.g.
     *         metamask, warn this before signing).
     *         Giveaways that use Chainlink VRF oracle will be fulfilled automatically by Chainlink. Giveaways that
     *         require founders to unlock will be fulfilled by the founders.
     */
    function draw() external nonReentrant {
        if (chainlinkSubscriptionId == 0) {
            revert ChainlinkSubscriptionNotFound();
        }
        if (PRIZES[drawCounts].checkpoint > _currentIndex)
            revert NoGiveawayToTrigger();
        while (PRIZES[drawCounts].checkpoint < _currentIndex + 1) {
            uint256 requestId;
            if (
                (PRIZES[drawCounts].isContest &&
                    block.timestamp <
                    publicSaleStartTimestamp + PARAMETERS.contestDuration) ||
                (drawCounts == MYSTERY_CHALLENGE.prizeIndex)
            ) {
                requestId = _computeRequestId(drawCounts);
            } else {
                requestId = COORDINATOR.requestRandomWords(
                    gasKeyHash,
                    chainlinkSubscriptionId,
                    5, // requestConfirmations
                    500_000, // callbackGasLimit
                    1 // numWords
                );
            }
            fulfillments[requestId] = Fulfillment(PRIZES[drawCounts++], false);
        }
    }

    function _computeRequestId(uint256 id) private pure returns (uint256) {
        return
            uint256(keccak256(abi.encodePacked(uint8(id % type(uint8).max))));
    }

    function _fulfill(
        uint256 requestId,
        address winner,
        uint256 selectedToken
    ) internal nonReentrant {
        if (fulfillments[requestId].fulfilled) {
            revert FulfillmentAlreadyFulfilled();
        }
        if (fulfillments[requestId].prize.amount == 0)
            revert FulfillRequestForNonExistentContest();
        fulfillments[requestId].fulfilled = true;
        winners.push(Winner(winner, uint16(selectedToken)));
        (bool success, ) = winner.call{
            value: fulfillments[requestId].prize.amount
        }("");
        if (!success) revert TransferFailed();
    }

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords)
        internal
        override
    {
        uint256 checkpoint = fulfillments[requestId].prize.checkpoint;
        uint256 selectedToken = randomWords[0] % checkpoint;
        address winner = ERC721A.ownerOf(selectedToken);
        _fulfill(requestId, winner, selectedToken);
    }

    /**
     * @notice This function lets the owner fulfill a giveaway. If the giveaway has not been unlocked, this will
     *         revert.
     * @param giveawayIndex The index of the giveaway to fulfill, 0 based (the first giveaway is index 0).
     * @param winner The selected winner address.
     * @param selectedToken The selected token to be displayed on the website.
     */
    function fulfillContest(
        uint256 giveawayIndex,
        address winner,
        uint256 selectedToken
    ) external nonReentrant onlyOwner {
        uint256 requestId = _computeRequestId(giveawayIndex);
        _fulfill(requestId, winner, selectedToken);
    }

    /**
     * @notice Call this when, you know, you probably know what you're doing here.
     *         revert.
     * @param value Word biggest mysteries are solved with this single value.
     * @param tokenId The selected token to be displayed on the website. This should be owned by the winner.
     */
    function TheAnswer(uint256 value, uint256 tokenId) external nonReentrant {
        if (ENS.ownerOf(MYSTERY_CHALLENGE.ensId) != _msgSender()) {
            revert MysteryChallengeSenderDoesNotOwnENS();
        }
        if (value != MYSTERY_CHALLENGE.value) {
            revert MysteryChallengeValueDoesNotMatch();
        }
        if (ERC721A.ownerOf(tokenId) != _msgSender()) {
            revert MysteryChallengeSenderDoesNotOwnToken();
        }
        _fulfill(
            _computeRequestId(MYSTERY_CHALLENGE.prizeIndex),
            _msgSender(),
            tokenId
        );
    }
}
