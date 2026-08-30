// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract VerityReceiptAnchor {
    address public immutable owner;
    mapping(bytes32 => uint64) public anchoredAt;
    mapping(bytes32 => string) public storageUri;
    event ReceiptAnchored(bytes32 indexed receiptHash, string storageUri, uint64 timestamp);

    constructor() { owner = msg.sender; }

    function anchor(bytes32 receiptHash, string calldata uri) external {
        require(msg.sender == owner, "NOT_OWNER");
        require(receiptHash != bytes32(0), "EMPTY_HASH");
        require(anchoredAt[receiptHash] == 0, "ALREADY_ANCHORED");
        uint64 timestamp = uint64(block.timestamp);
        anchoredAt[receiptHash] = timestamp;
        storageUri[receiptHash] = uri;
        emit ReceiptAnchored(receiptHash, uri, timestamp);
    }
}
