// SPDX-License-Identifier: MIT

pragma solidity ^0.8.12;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "../interfaces/ICoBotsRendererV2.sol";

/*  @title CoBots Renderer V2
    @author Clement Walter
    @dev Update color palette, remove colors and use metta instead of status
*/
contract CoBotsRendererV2 is Ownable, ReentrancyGuard, ICoBotsRendererV2 {
    function tokenURI(uint256 tokenId, uint8 seed)
        public
        view
        returns (string memory)
    {
        return "";
    }
}
