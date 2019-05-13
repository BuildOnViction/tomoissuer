pragma solidity ^0.4.24;

library SafeMath {

	/**
	 * @dev Multiplies two numbers, reverts on overflow.
	 */
	function mul(uint256 a, uint256 b) internal pure returns (uint256) {
		// Gas optimization: this is cheaper than requiring 'a' not being zero, but the
		// benefit is lost if 'b' is also tested.
		// See: https://github.com/OpenZeppelin/openzeppelin-solidity/pull/522
		if (a == 0) {
			return 0;
		}

		uint256 c = a * b;
		require(c / a == b);

		return c;
	}

	/**
	 * @dev Integer division of two numbers truncating the quotient, reverts on division by zero.
	 */
	function div(uint256 a, uint256 b) internal pure returns (uint256) {
		require(b > 0); // Solidity only automatically asserts when dividing by 0
		uint256 c = a / b;
		// assert(a == b * c + a % b); // There is no case in which this doesn't hold

		return c;
	}

	/**
	* @dev Subtracts two numbers, reverts on overflow (i.e. if subtrahend is greater than minuend).
	*/
	function sub(uint256 a, uint256 b) internal pure returns (uint256) {
		require(b <= a);
		uint256 c = a - b;

		return c;
	}

	/**
	* @dev Adds two numbers, reverts on overflow.
	*/
	function add(uint256 a, uint256 b) internal pure returns (uint256) {
		uint256 c = a + b;
		require(c >= a);

		return c;
	}

	/**
	* @dev Divides two numbers and returns the remainder (unsigned integer modulo),
	* reverts when dividing by zero.
		*/
	function mod(uint256 a, uint256 b) internal pure returns (uint256) {
		require(b != 0);
		return a % b;
	}
}

contract TRC21Issuer {
    using SafeMath for uint256;
    uint256 public _delay;
    uint256 _minApply;
    address[] _tokens;
    mapping(address=>TokenState) tokensState;


    struct TokenState{
        uint256 balance;
        address owner;
        bool isActive;
        uint256 endNumber;
    }

    constructor (uint256 delay, uint256 value) public {
        _delay=delay;
        _minApply=value;
    }

    function minApply() public view returns(uint256) {
        return _minApply;
    }

    function withdrawDelay() public view returns(uint256) {
        return _delay;
    }

    function tokens() public view returns(address[]) {
        return _tokens;
    }

    function tokenBalance(address token) public view returns(uint256) {
        return tokensState[token].balance;
    }

    function tokenOwner(address token) public view returns(address) {
        return tokensState[token].owner;
    }

    function tokenStatus(address token) public view returns(bool) {
        return tokensState[token].isActive;
    }

    function tokenEndNumber(address token) public view returns(uint256) {
        return tokensState[token].endNumber;
    }

    modifier isOwnerToken(address token){
        require(token != address(0));
        require(tokensState[token].owner==msg.sender);
        _;
    }
    modifier onlyValidApplyNewToken(address token){
        require(token != address(0));
        require(msg.value >= _minApply);
        require(tokensState[token].owner==address(0));
        _;
    }

    modifier onlyValidActiveToken(address token){
        require(token != address(0));
        require(tokensState[token].isActive);
        _;
    }

    modifier onlyValidWithDrawToken(address token){
        require(token != address(0));
        require(!tokensState[token].isActive);
        require(tokensState[token].endNumber>0);
        require(tokensState[token].endNumber>=block.number);
        _;
    }

    modifier onlyValidReActiveToken(address token){
        require(token != address(0));
        require(!tokensState[token].isActive);
        _;
    }

    function applyToken(address token) public payable onlyValidApplyNewToken(token){
        _tokens.push(token);
        tokensState[token] = TokenState({
            owner: msg.sender,
            isActive: true,
            balance:msg.value,
            endNumber:0
        });
    }

    function depositFee(address token) public payable isOwnerToken(token) onlyValidActiveToken(token){
        uint256 newBalance = tokensState[token].balance.add(msg.value);
        tokensState[token].balance=newBalance;
    }
    function resignToken(address token) public isOwnerToken(token) onlyValidActiveToken(token) {
        uint256 withdrawNumber = _delay.add(block.number);
        tokensState[token].endNumber==withdrawNumber;
        tokensState[token].isActive=false;
    }

    function reActiveToken(address token) public isOwnerToken(token) onlyValidReActiveToken(token) {
        tokensState[token].endNumber==0;
        tokensState[token].isActive=true;
    }

    function withdrawToken(address token) public isOwnerToken(token) onlyValidWithDrawToken(token) {
        msg.sender.transfer(tokensState[token].balance);
        tokensState[token].balance=0;
    }
}
