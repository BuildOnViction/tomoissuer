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

contract Issuer {
    using SafeMath for uint256;

    uint256 public withdrawDelay;
    address[] tokens;
    mapping(address=>TokenState) tokenStates;
    uint256 minApply;

    struct TokenState{
        address owner;
        uint256 balance;
        bool isActive;
        uint256 endNumber;
    }

    constructor (uint256 delay, uint256 value) public {
        withdrawDelay=delay;
        minApply=value;
    }

    modifier isOwnerToken(address token){
        require(token != address(0));
        require(tokenStates[token].owner==msg.sender);
        _;
    }
    modifier onlyValidNewToken(address token){
        require(token != address(0));
        require(msg.value >= minApply);
        require(tokenStates[token].owner==address(0));
        _;
    }

    modifier onlyValidActiveToken(address token){
        require(token != address(0));
        require(tokenStates[token].isActive);
        _;
    }

    modifier onlyValidWithDrawToken(address token){
        require(token != address(0));
        require(!tokenStates[token].isActive);
        require(tokenStates[token].endNumber>0);
        require(tokenStates[token].endNumber>=block.number);
        _;
    }

    modifier onlyValidReActiveToken(address token){
        require(token != address(0));
        require(!tokenStates[token].isActive);
        _;
    }

    function applyToken(address token) public payable onlyValidNewToken(token){
        tokens.push(token);
        tokenStates[token] = TokenState({
            owner: msg.sender,
            isActive: true,
            balance:msg.value,
            endNumber:0
        });
    }

    function depositFee(address token) public payable isOwnerToken(token) onlyValidActiveToken(token){
        uint256 newBalance = tokenStates[token].balance.add(msg.value);
        tokenStates[token].balance=newBalance;
    }

    function resignToken(address token) public isOwnerToken(token) onlyValidActiveToken(token) {
        uint256 withdrawNumber = withdrawDelay.add(block.number);
        tokenStates[token].endNumber==withdrawNumber;
        tokenStates[token].isActive=false;
    }

    function reActiveToken(address token) public isOwnerToken(token) onlyValidReActiveToken(token) {
        tokenStates[token].endNumber==0;
        tokenStates[token].isActive=true;
    }

    function withdrawToken(address token) public isOwnerToken(token) onlyValidWithDrawToken(token) {
        msg.sender.transfer(tokenStates[token].balance);
        tokenStates[token].balance=0;
    }
}
