// SPDX-License-Identifier: MIT

pragma solidity ^0.8.12;

import "@0xsequence/sstore2/contracts/SSTORE2.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import {CollectionEncoded} from "@clemlaflemme.eth/contracts/contracts/lib/renderers/RectEncoder.sol";
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
    using Integers for uint256;

    address palettePointer;
    address collectionPointer;
    string[] characteristicNames;
    string[][] traitNames;
    string description;
    ICoBotsRenderer coBotsRenderer;

    event ColorPaletteChanged(address _palette);
    event CollectionChanged(address prevPointer, address newPointer);

    function storePalette(bytes memory palette) public {
        palettePointer = SSTORE2.write(palette);
        emit ColorPaletteChanged(palettePointer);
    }

    function storeCollection(CollectionEncoded memory collection) public {
        address prevPointer = collectionPointer;
        collectionPointer = SSTORE2.write(collection.traits);
        characteristicNames = collection.characteristicNames;
        traitNames = collection.traitNames;
        description = collection.description;
        emit CollectionChanged(prevPointer, collectionPointer);
    }

    constructor(address _coBotsRenderer) {
        coBotsRenderer = ICoBotsRenderer(_coBotsRenderer);
    }

    function getCoBotItems(uint256 tokenId, uint8 seed)
        public
        view
        returns (uint256[10] memory)
    {
        (
            uint256 eyesIndex,
            uint256 mouthIndex,
            uint256 antennaIndex,
            uint256 feetIndex
        ) = coBotsRenderer.getRandomItems(tokenId, seed);

        // Characteristics are stored in alphabetical order:
        uint256[10] memory items;
        items[0] = antennaIndex;
        items[1] = 0; // always Black for the Extravagainza
        items[2] = tokenId / 1000;
        items[3] = (tokenId / 100) % 10;
        items[4] = (tokenId / 10) % 10;
        items[5] = tokenId % 10;
        items[6] = eyesIndex;
        items[7] = feetIndex;
        items[8] = 2 * (seed % 2); // Metta "Offline" disabled for the Extravagainza
        items[9] = mouthIndex;
        return items;
    }

    function getCoBotBytes(uint256[10] memory items)
        public
        view
        returns (bytes memory)
    {
        // but one needs another order for proper layering:
        return
            bytes.concat(
                RectRenderer.getTraitBytes(collectionPointer, 1, items[1]), // 1. Colour
                RectRenderer.getTraitBytes(collectionPointer, 2, items[2]), // 2. Digit 1
                RectRenderer.getTraitBytes(collectionPointer, 3, items[3]), // 3. Digit 2
                RectRenderer.getTraitBytes(collectionPointer, 4, items[4]), // 4. Digit 3
                RectRenderer.getTraitBytes(collectionPointer, 5, items[5]), // 5. Digit 4
                RectRenderer.getTraitBytes(collectionPointer, 6, items[6]), // 6. Eyes
                RectRenderer.getTraitBytes(collectionPointer, 9, items[9]), // 9. Mouth
                RectRenderer.getTraitBytes(collectionPointer, 0, items[0]), // 0. Antenna
                RectRenderer.getTraitBytes(collectionPointer, 7, items[7]), // 7. Feet
                RectRenderer.getTraitBytes(collectionPointer, 8, items[8]) // 8. Metta
            );
    }

    function imageURI(uint256[10] memory items)
        public
        view
        returns (string memory)
    {
        return
            string.concat(
                RendererCommons.DATA_URI,
                coBotsRenderer.SVG_TAG_START(),
                RectRenderer.decodeBytesMemoryToRects(
                    getCoBotBytes(items),
                    RendererCommons.getPalette(palettePointer)
                ),
                coBotsRenderer.SVG_TAG_END()
            );
    }

    function getCoBotAttributes(uint256[10] memory items)
        public
        view
        returns (string memory)
    {
        uint8[5] memory indexes = [6, 8, 0, 7, 9];
        string[] memory attributes = new string[](5);
        for (uint256 i = 0; i < 5; i++) {
            attributes[i] = string.concat(
                '{"trait_type": "',
                characteristicNames[indexes[i]],
                '", "value": "',
                traitNames[indexes[i]][items[indexes[i]]],
                '"}'
            );
        }
        return string.concat("[", attributes.join(","), "]");
    }

    function tokenURI(uint256 tokenId, uint8 seed)
        public
        view
        returns (string memory)
    {
        uint256[10] memory items = getCoBotItems(tokenId, seed);
        return
            string.concat(
                "data:application/json,",
                '{"image": "',
                imageURI(items),
                '"',
                ',"description": "',
                description,
                '"',
                ',"name": "Co-Bot #',
                tokenId.toString(),
                '"',
                ',"attributes": ',
                getCoBotAttributes(items),
                "}"
            );
    }
}
