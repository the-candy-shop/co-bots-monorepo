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
error FulfillmentAlreadyFulfilled();
error FulfillRequestForNonExistentContest();

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
    uint8 public constant MAX_MINT_PER_ADDRESS = 20;
    uint8 public constant MINT_FOUNDERS = 3;
    Parameters PARAMETERS;
    Prize[] PRIZES;
    MysteryChallenge MYSTERY_CHALLENGE;
    IERC721 ENS;

    ////////////////////////////////////////////////////////////////////////
    ////////////////////////// Token ///////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////

    address public renderingContractAddress;
    ICoBotsRendererV2 public renderer;
    uint8[] public coBotsSeeds;

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
        MYSTERY_CHALLENGE = _mysteryChallenge;
    }

    function _mintCoBots(address to, uint256 quantity) internal {
        if (quantity > 32) revert BatchLimitExceeded();
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
            coBotsSeeds.push(uint8(seeds[i]) << 1); // insure last digit is 0
        }

        ERC721A._safeMint(to, quantity);
    }

    function mintPublicSale(uint256 quantity)
        external
        payable
        whenPublicSaleOpen
        nonReentrant
    {
        if (msg.value != PARAMETERS.mintPublicPrice * quantity)
            revert WrongPrice();
        if (_currentIndex + quantity > PARAMETERS.maxCobots)
            revert TotalSupplyExceeded();
        if (ERC721A.balanceOf(_msgSender()) + quantity > MAX_MINT_PER_ADDRESS)
            revert AllocationExceeded();
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

    mapping(address => uint256) public prizePerAddress;
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

    function draw() external nonReentrant {
        if (chainlinkSubscriptionId == 0) {
            revert ChainlinkSubscriptionNotFound();
        }
        while (PRIZES[drawCounts].checkpoint < _currentIndex + 1) {
            uint256 requestId;
            if (
                PRIZES[drawCounts].isContest &&
                block.timestamp <
                publicSaleStartTimestamp + PARAMETERS.contestDuration
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
        prizePerAddress[winner] = fulfillments[requestId].prize.amount;
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
        while (prizePerAddress[winner] > 0 || (selectedToken < MINT_FOUNDERS)) {
            selectedToken = (selectedToken >> 1) % checkpoint;
            winner = ERC721A.ownerOf(selectedToken);
        }
        _fulfill(requestId, winner, selectedToken);
    }

    function fulfillContest(
        uint256 giveawayIndex,
        address winner,
        uint256 selectedToken
    ) external nonReentrant onlyOwner {
        uint256 requestId = _computeRequestId(giveawayIndex);
        _fulfill(requestId, winner, selectedToken);
    }

    function fulfillMysteryChallenge(uint256 value, uint256 tokenId)
        external
        nonReentrant
    {
        if (ENS.ownerOf(MYSTERY_CHALLENGE.ensId) != _msgSender()) {
            revert MysteryChallengeSenderDoesNotOwnENS();
        }
        if (value != MYSTERY_CHALLENGE.value) {
            revert MysteryChallengeValueDoesNotMatch();
        }
        _fulfill(
            _computeRequestId(MYSTERY_CHALLENGE.prizeIndex),
            _msgSender(),
            tokenId
        );
    }
}
