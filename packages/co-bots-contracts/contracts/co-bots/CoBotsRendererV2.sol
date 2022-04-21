// SPDX-License-Identifier: MIT

pragma solidity ^0.8.12;

import "@0xsequence/sstore2/contracts/SSTORE2.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import {RendererCommons} from "@clemlaflemme.eth/contracts/contracts/lib/renderers/RendererCommons.sol";
import {RectRenderer} from "@clemlaflemme.eth/contracts/contracts/lib/renderers/RectRenderer.sol";
import {Array} from "@clemlaflemme.eth/contracts/contracts/lib/utils/Array.sol";
import {Integers} from "@clemlaflemme.eth/contracts/contracts/lib/utils/Integers.sol";
import "../interfaces/ICoBotsRendererV2.sol";
import "../interfaces/ICoBotsRenderer.sol";

/*  @title CoBots Renderer V2
    @author Clement Walter
    @dev Update color palette, remove colors and use metta instead of status
*/
contract CoBotsRendererV2 is Ownable, ReentrancyGuard, ICoBotsRendererV2 {
    using Array for string[];
    using Array for bytes[];
    using Integers for uint256;

    address palettePointer;
    address collectionPointer;
    ICoBotsRenderer coBotsRenderer;

    event ColorPaletteChanged(address prevPointer, address newPointer);
    event CollectionChanged(address prevPointer, address newPointer);

    function storePalette(bytes memory palette) public {
        address prevPointer = palettePointer;
        palettePointer = SSTORE2.write(palette);
        emit ColorPaletteChanged(prevPointer, palettePointer);
    }

    function storeCollection(bytes memory traits) public {
        address prevPointer = collectionPointer;
        collectionPointer = SSTORE2.write(traits);
        emit CollectionChanged(prevPointer, collectionPointer);
    }

    constructor(address _coBotsRenderer) {
        coBotsRenderer = ICoBotsRenderer(_coBotsRenderer);
    }

    function getCoBotItems(uint256 tokenId, uint8 seed)
        public
        view
        returns (uint256[] memory)
    {
        (
            uint256 eyesIndex,
            uint256 mouthIndex,
            uint256 antennaIndex,
            uint256 feetIndex
        ) = coBotsRenderer.getRandomItems(tokenId, seed);

        uint256[] memory items = new uint256[](10);
        items[0] = 0; // always Black for the Extravagainza
        items[1] = tokenId / 1000;
        items[2] = (tokenId / 100) % 10;
        items[3] = (tokenId / 10) % 10;
        items[4] = tokenId % 10;
        items[5] = eyesIndex;
        items[6] = mouthIndex;
        items[7] = antennaIndex;
        items[8] = feetIndex;
        items[9] = seed % 2; // Metta "Offline" disabled for the Extravagainza
        return items;
    }

    function imageURI(uint256[] memory items)
        public
        view
        returns (string memory)
    {
        return
            string.concat(
                RendererCommons.DATA_URI,
                coBotsRenderer.SVG_TAG_START(),
                RectRenderer.decodeBytesMemoryToRects(
                    RectRenderer.imageBytes(collectionPointer, items),
                    RendererCommons.getPalette(palettePointer)
                ),
                coBotsRenderer.SVG_TAG_END()
            );
    }

    function getCoBotAttributes(uint256[] memory items)
        public
        pure
        returns (string memory)
    {
        // Inlined instead of using the encoded names from the RectRenderer because not all the characteristics are
        // used in the Extravagainza, so saving gas with this.
        string[12] memory antenna = [
            "Angelic",
            "Buggy",
            "Buzzed",
            "Classic",
            "Hacky",
            "Humbled",
            "Impish",
            "Jumpy",
            "Punk",
            "Royal",
            "Serious",
            "Western"
        ];
        string[12] memory eyes = [
            "Awoken",
            "Classic",
            "Cyclops",
            "Flirty",
            "Hacky",
            "Nounish",
            "Optimistic",
            "Sadhappy",
            "Smitten",
            "Super",
            "Unaligned",
            "Zen"
        ];
        string[11] memory feet = [
            "Classic",
            "Energetic",
            "Firey",
            "Ghostly",
            "Heavy Duty",
            "Hobbled",
            "Little Energetic",
            "Little Firey",
            "Little Roller",
            "Pushy",
            "Roller"
        ];
        string[2] memory metta = ["Off", "On"];
        string[11] memory mouth = [
            "Bigsad",
            "Classic",
            "Happy",
            "Knightly",
            "Shady",
            "Shy",
            "Smug",
            "Thirsty",
            "Villainous",
            "Worried",
            "Wowed"
        ];

        return
            string.concat(
                "[",
                '{"trait_type": "Eyes", "value": "',
                eyes[items[5]],
                '"},',
                '{"trait_type": "Feet", "value": "',
                feet[items[8]],
                '"},',
                '{"trait_type": "Metta", "value": "',
                metta[items[9]],
                '"},',
                '{"trait_type": "Mouth", "value": "',
                mouth[items[6]],
                '"},',
                '{"trait_type": "Antenna", "value": "',
                antenna[items[7]],
                '"}',
                "]"
            );
    }

    function tokenURI(uint256 tokenId, uint8 seed)
        public
        view
        returns (string memory)
    {
        uint256[] memory items = getCoBotItems(tokenId, seed);
        return
            string.concat(
                "data:application/json,",
                '{"image": "',
                imageURI(items),
                '"',
                ',"description": "Co-Bots are cooperation robots | CC0 & 100% On-Chain | co-bots.com."',
                ',"name": "Co-Bot #',
                tokenId.toString(),
                '"',
                ',"attributes": ',
                getCoBotAttributes(items),
                "}"
            );
    }
}
