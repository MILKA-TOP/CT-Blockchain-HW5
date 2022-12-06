pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MilkaVote {
    event CreatedProposal(uint256 indexed hash);
    event AcceptedProposal(uint256 indexed hash);
    event RejectedProposal(uint256 indexed hash);
    event DisableProposal(uint256 indexed hash);

    uint32 constant ALL_COUNT_COINS = 100 * 1000000;
    uint32 constant CONFIRM_COUNT_COINS = 50 * 1000000;
    uint256 constant DELAY = 3 * 24 * 60 * 60;

    struct Proposal {
        uint256 hashId;
        uint256 acceptVotes;
        uint256 rejectVotes;
        uint256 endTime;
        bool status;
        mapping(address => uint256) users;
    }

    Proposal[3] propArray;
    ERC20 voteCoin; 

    constructor(ERC20 inputVoteCoin) {
        voteCoin = inputVoteCoin;
    }

    modifier hashExists(uint256 hashId) {
        for (uint i = 0; i < 3; i++) { // try require
            require(propArray[i].hashId != hashId);         
        }
        _;
    }

    function createNewProposal(uint256 hashId) public hashExists(hashId) {
        int256 prodArrayIndexMaybe = _getFreeProposal(hashId);
        if (prodArrayIndexMaybe == -1) return;

        uint256 prodArrayIndex = uint256(prodArrayIndexMaybe);
        propArray[prodArrayIndex].status = true;
        propArray[prodArrayIndex].hashId = hashId;
        propArray[prodArrayIndex].endTime = block.timestamp + DELAY;
        emit CreatedProposal(hashId);
    }

    function makeAgreeVotes(uint256 hashId) public {
        _makeVote(hashId, true);
    }

    function makeRejectVotes(uint256 hashId) public {
        _makeVote(hashId, false);
    }

    function containsFreeProps() public view returns (bool) {
        for (uint i = 0; i < 3; i++) { // try return index
            if (!propArray[i].status) return true;         
        }
        return false;
    }

    function _makeVote(uint256 hashId, bool isAgreeVotes) private {
        int256 prodArrayIndexMaybe = _getPropByHash(hashId);
        require(prodArrayIndexMaybe != -1, "Uknown hashId");
        uint256 propIndex = uint256(prodArrayIndexMaybe);

        if (_timeCheck(propIndex)) return;
        require(propArray[propIndex].users[msg.sender] != hashId, "User already voted");

        uint balance = voteCoin.balanceOf(msg.sender);

        if (isAgreeVotes) propArray[propIndex].acceptVotes += balance;
        else propArray[propIndex].rejectVotes += balance;

        propArray[propIndex].users[msg.sender] = hashId;

        _checkVotesCount(propIndex);
    }

    function _getFreeProposal(uint256 hashId) public returns (int256) {
        for (uint i = 0; i < 3; i++) { // try cleaning
            _timeCheck(i);         
        }
        for (uint i = 0; i < 3; i++) { // try return index
            if (!propArray[i].status) return int256(i);         
        }

        emit DisableProposal(hashId);
        return -1;
    }

    // Return true, if emmited
    function _timeCheck(uint256 propIndex) private returns (bool) {
        if (block.timestamp > propArray[propIndex].endTime) {

            if (_checkVotesCount(propIndex)) {
                return true;
            }

            emit DisableProposal(propArray[propIndex].hashId);
            _clearProp(propIndex);
            return true;
        }
        return false;
    }

    // Return true, if emmited
    function _checkVotesCount(uint256 propIndex) private returns (bool) {
        if (propArray[propIndex].acceptVotes >= CONFIRM_COUNT_COINS) {
            emit AcceptedProposal(propArray[propIndex].hashId);
            _clearProp(propIndex);
            return true;
        }

        if (propArray[propIndex].rejectVotes >= CONFIRM_COUNT_COINS) {
            emit RejectedProposal(propArray[propIndex].hashId);
            _clearProp(propIndex);
            return true;
        }

        return false;
    }

    function _clearProp(uint256 propIndex) public {
        delete propArray[propIndex];
    }

    function _getPropByHash(uint256 hashId) private view returns (int256) {
        for (uint256 i = 0; i < 3; i++) { // try return index
            if (propArray[i].hashId == hashId) return int256(i);        
        }
        return -1;
    }
}
