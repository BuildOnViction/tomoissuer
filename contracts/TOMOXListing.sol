pragma solidity ^0.4.24;

contract TOMOXListing {

    uint256 _minApply;
    address[] _tokens;
    mapping(address => TokenState) tokensState;


    struct TokenState {
        uint256 capacity;
        bool isActive;
    }

    constructor (uint256 value) public {
        _minApply = value;
    }

    modifier onlyValidApplyNewToken(address token){
        require(token != address(0));
        require(msg.value >= _minApply);
        require(tokensState[token].isActive != true);
        _;
    }

    function minApply() public view returns(uint256) {
        return _minApply;
    }

    function tokens() public view returns(address[]) {
        return _tokens;
    }

    function getTokenStatus(address token) public view returns(bool) {
        return tokensState[token].isActive;
    }

    function applyToken(address token) public payable onlyValidApplyNewToken(token){
        _tokens.push(token);
        tokensState[token] = TokenState({
            isActive: true,
            capacity: msg.value
        });
    }
}
