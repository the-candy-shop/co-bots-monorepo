// SPDX-License-Identifier: MIT

pragma solidity ^0.8.12;

interface ICoBotsRendererV2 {
    function tokenURI(uint256 tokenId, uint8 seed)
        external
        view
        returns (string memory);
}
