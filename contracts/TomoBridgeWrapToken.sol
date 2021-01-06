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

/**
 * @title TRC21 interface
 */
interface ITRC21 {
    function totalSupply() external view returns (uint256);

    function balanceOf(address who) external view returns (uint256);

    function issuer() external view returns (address);

    function decimals() external view returns (uint8);

    function estimateFee(uint256 value) external view returns (uint256);

    function allowance(address owner, address spender) external view returns (uint256);

    function transfer(address to, uint256 value) external returns (bool);

    function approve(address spender, uint256 value) external returns (bool);

    function transferFrom(address from, address to, uint256 value) external returns (bool);

    event Transfer(address indexed from, address indexed to, uint256 value);

    event Approval(address indexed owner, address indexed spender, uint256 value);

    event Fee(address indexed from, address indexed to, address indexed issuer, uint256 value);
}

/**
 * @title Standard TRC21 token
 * @dev Implementation of the basic standard token.
 */
contract TRC21 is ITRC21 {
    using SafeMath for uint256;

    mapping (address => uint256) private _balances;
    uint256 private _minFee;
    address private _issuer;
    mapping (address => mapping (address => uint256)) private _allowed;
    uint256 private _totalSupply;

    string private _name;
    string private _symbol;
    uint8 private _decimals;

    constructor (string memory name, string memory symbol, uint8 decimals) public {
        _name = name;
        _symbol = symbol;
        _decimals = decimals;
    }

    function name() public view returns (string) {
        return _name;
    }

    function symbol() public view returns (string) {
        return _symbol;
    }

    function decimals() public view returns (uint8) {
        return _decimals;
    }

    /**
     * @dev Total number of tokens in existence
     */
    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    /**
     * @dev  The amount fee that will be lost when transferring.
     */
    function minFee() public view returns (uint256) {
        return _minFee;
    }

    /**
     * @dev token's foundation
     */
    function issuer() public view returns (address) {
        return _issuer;
    }

    /**
     * @dev Gets the balance of the specified address.
     * @param owner The address to query the balance of.
     * @return An uint256 representing the amount owned by the passed address.
     */
    function balanceOf(address owner) public view returns (uint256) {
        return _balances[owner];
    }

    /**
     * @dev Estimate transaction fee.
     * @param value amount tokens sent
     */
    function estimateFee(uint256 value) public view returns (uint256) {
        return value.mul(0).add(_minFee);
    }

    function setMinFee(uint256 value) public {
        require(msg.sender == _issuer);
        _changeMinFee(value);
    }

    /**
     * @dev Function to check the amount of tokens that an owner allowed to a spender.
     * @param owner address The address which owns the funds.
     * @param spender address The address which will spend the funds.
     * @return A uint256 specifying the amount of tokens still available for the spender.
     */
    function allowance(address owner,address spender) public view returns (uint256){
        return _allowed[owner][spender];
    }

    /**
     * @dev Transfer token for a specified address
     * @param to The address to transfer to.
     * @param value The amount to be transferred.
     */
    function transfer(address to, uint256 value) public returns (bool) {
        require(to != address(0));
        uint256 total = value.add(_minFee);
        require(total <= _balances[msg.sender]);    
        _transfer(msg.sender, to, value);
        if (_minFee > 0) {
            _transfer(msg.sender, _issuer, _minFee);
            emit Fee(msg.sender, to, _issuer, _minFee);
        }
        return true;
    }


    /**
     * @dev Approve the passed address to spend the specified amount of tokens on behalf of msg.sender.
     * Beware that changing an allowance with this method brings the risk that someone may use both the old
     * and the new allowance by unfortunate transaction ordering. One possible solution to mitigate this
     * race condition is to first reduce the spender's allowance to 0 and set the desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     * @param spender The address which will spend the funds.
     * @param value The amount of tokens to be spent.
     */
    function approve(address spender, uint256 value) public returns (bool) {
        require(spender != address(0));
        require(_balances[msg.sender] >= _minFee);
        _allowed[msg.sender][spender] = value;
        _transfer(msg.sender, _issuer, _minFee);
        emit Approval(msg.sender, spender, value);
        return true;
    }

    /**
     * @dev Transfer tokens from one address to another
     * @param from address The address which you want to send tokens from
     * @param to address The address which you want to transfer to
     * @param value uint256 the amount of tokens to be transferred
     */
    function transferFrom(address from,	address to,	uint256 value)	public returns (bool) {
        uint256 total = value.add(_minFee);
        require(total <= _balances[from]);   
        require(value <= _allowed[from][msg.sender]);   //msg.sender should be allowed to transfer maximum of value amount

        _allowed[from][msg.sender] = _allowed[from][msg.sender].sub(total);
        _transfer(from, to, value);
        _transfer(from, _issuer, _minFee);
        emit Fee(msg.sender, to, _issuer, _minFee);
        return true;
    }

    /**
     * @dev Transfer token for a specified addresses
     * @param from The address to transfer from.
     * @param to The address to transfer to.
     * @param value The amount to be transferred.
     */
    function _transfer(address from, address to, uint256 value) internal {
        require(value <= _balances[from]);
        require(to != address(0));  
        _balances[from] = _balances[from].sub(value);
        _balances[to] = _balances[to].add(value);
        emit Transfer(from, to, value); 
    }

    /**
     * @dev Internal function that mints an amount of the token and assigns it to
     * an account. This encapsulates the modification of balances such that the
     * proper events are emitted.
     * @param account The account that will receive the created tokens.
     * @param value The amount that will be created.
     */
    function _mint(address account, uint256 value) internal {
        require(account != 0);
        _totalSupply = _totalSupply.add(value);
        _balances[account] = _balances[account].add(value);
        emit Transfer(address(0), account, value);
    }

    /**
     * @dev Internal function that burns an amount of the token of a given
     * account.
     * @param account The account whose tokens will be burnt.
     * @param value The amount that will be burnt.
     */
    function _burn(address account, uint256 value) internal {
        require(account != 0);
        require(value <= _balances[account]);

        _totalSupply = _totalSupply.sub(value);
        _balances[account] = _balances[account].sub(value);
        emit Transfer(account, address(0), value);
    }

    /**
     * @dev Transfers token's foundation to new issuer
     * @param newIssuer The address to transfer ownership to.
     */
    function _changeIssuer(address newIssuer) internal {
        require(newIssuer != address(0));
        _issuer = newIssuer;
    }

    /**
     * @dev Change minFee
     * @param value minFee
     */
    function _changeMinFee(uint256 value) internal {
        _minFee = value;
    }
}

//Wrap token based on multisig wallet that only mints new token if there are user deposits 
contract TomoBridgeWrapToken is TRC21 {
    /*
     *  Events
     */
    // event TxBurn(uint indexed transactionId);
    event Confirmation(address indexed sender, uint indexed transactionId);
    event Revocation(address indexed sender, uint indexed transactionId);
    event Submission(uint indexed transactionId);
    event Execution(uint indexed transactionId);
    event ExecutionFailure(uint indexed transactionId);
    event OwnerAddition(address indexed owner);
    event OwnerRemoval(address indexed owner);
    event RequirementChange(uint required);
    event TokenBurn(uint256 indexed burnID, address indexed burner, uint256 value, bytes data);
    event ToggleFeeByTomoMode(bool isFeeByTomoMode);
    event SetWithdrawFeeTomo(uint withdrawFeeTomo);
    event SetReceivingFeeWallet(address receivingFeeWallet);

    /*
     *  Constants
     */
    uint constant public MAX_OWNER_COUNT = 50;
    uint public WITHDRAW_FEE = 0;
    uint public DEPOSIT_FEE = 0;
    uint public WITHDRAW_FEE_TOMO = 4 ether; // 4 TOMO
    bool public TOMO_FEE_MODE = true;
    
    /*
     *  Storage
     */
    mapping (uint => Transaction) public transactions;
    mapping (uint => mapping (address => bool)) public confirmations;
    mapping (address => bool) public isOwner;
    address[] public owners;
    uint public required;
    uint public transactionCount;
    TokenBurnData[] public burnList;
    string public original_contract;
    string public original_network;
    address public receivingFeeWallet;

    struct TokenBurnData {
        uint256 value;
        address burner;
        bytes data;
    }
    
    struct Transaction {
        address destination;
        uint value;
        bytes data; //data is used in transactions altering owner list
        bool executed;
    }

    /*
     *  Modifiers
     */
    modifier onlyWallet() {
        require(msg.sender == address(this));
        _;
    }

    modifier onlyContractIssuer() {
        require(msg.sender == issuer());
        _;
    }

    modifier ownerDoesNotExist(address owner) {
        require(!isOwner[owner]);
        _;
    }

    modifier ownerExists(address owner) {
        require(isOwner[owner]);
        _;
    }

    modifier transactionExists(uint transactionId) {
        require(transactions[transactionId].destination != 0);
        _;
    }

    modifier confirmed(uint transactionId, address owner) {
        require(confirmations[transactionId][owner]);
        _;
    }

    modifier notConfirmed(uint transactionId, address owner) {
        require(!confirmations[transactionId][owner]);
        _;
    }

    modifier notExecuted(uint transactionId) {
        require(!transactions[transactionId].executed);
        _;
    }

    modifier notNull(address _address) {
        require(_address != 0);
        _;
    }

    modifier validRequirement(uint ownerCount, uint _required) {
        require(ownerCount <= MAX_OWNER_COUNT
        && _required <= ownerCount
        && _required != 0
        && ownerCount != 0);
        _;
    }

    /*
     * Public functions
     */
    /// @dev Contract constructor sets initial owners and required number of confirmations.
    /// @param _owners List of initial owners.
    /// @param _required Number of required confirmations.
    constructor (address[] _owners,
                 uint _required, string memory _name,
                 string memory _symbol, uint8 _decimals,
                 uint256 cap, uint256 minFee,
                 uint256[] depositAndWithdrawFee, string memory originContract, string memory network
                ) TRC21(_name, _symbol, _decimals) public validRequirement(_owners.length, _required) {

        for (uint i=0; i<_owners.length; i++) {
            require(!isOwner[_owners[i]] && _owners[i] != 0);
            isOwner[_owners[i]] = true;
        }
        {
            _mint(msg.sender, cap);
            _changeIssuer(msg.sender);
            _changeMinFee(minFee);
            owners = _owners;
            required = _required;
            DEPOSIT_FEE = depositAndWithdrawFee[0];
            WITHDRAW_FEE = depositAndWithdrawFee[1];
            original_contract = originContract;
            original_network = network;
            receivingFeeWallet = owners[0];
        }
    }

    function transferContractIssuer(address newOwner) public onlyContractIssuer {
        if (newOwner != address(0)) {
            _changeIssuer(msg.sender);
        }
    }

    function setDepositFee(uint256 depositFee)
    public
    onlyWallet
    {
        DEPOSIT_FEE = depositFee;
    }

    function setWithdrawFee(uint256 withdrawFee)
    public
    onlyWallet
    {
        WITHDRAW_FEE = withdrawFee;
    }

    /// @dev Allows to add a new owner. Transaction has to be sent by wallet.
    /// @param owner Address of new owner.
    function addOwner(address owner) 
    public
    onlyWallet
    ownerDoesNotExist(owner)
    notNull(owner)
    validRequirement(owners.length + 1, required)
    {
        isOwner[owner] = true;
        owners.push(owner);
        emit OwnerAddition(owner);
    }

    /// @dev Allows to change withdraw fee by tomo
    /// @param withdrawFee Number of required confirmations.
    function setWithdrawFeeTomo(uint withdrawFee)
    public
    onlyWallet
    {
        require(withdrawFee >= 0);
        WITHDRAW_FEE_TOMO = withdrawFee;
        emit SetWithdrawFeeTomo(withdrawFee);
    }

    /// @dev Allows to change withdraw fee mode. Transaction has to be sent by wallet.
    /// @param isFeeByTomoMode Fee mode.
    function toggleFeeByTomoMode(bool isFeeByTomoMode)
    public
    onlyWallet
    {
        TOMO_FEE_MODE = isFeeByTomoMode;
        emit ToggleFeeByTomoMode(TOMO_FEE_MODE);
    }

    /// @dev Allows to set receiving fee address. Transaction has to be sent by wallet.
    /// @param wallet Receiving fee address.
    function setReceivingFeeWallet(address wallet)
    public
    onlyWallet
    {
        receivingFeeWallet = wallet;
        emit SetReceivingFeeWallet(receivingFeeWallet);
    }

    /// @dev Allows to remove an owner. Transaction has to be sent by wallet.
    /// @param owner Address of owner.
    function removeOwner(address owner)
    public
    onlyWallet
    ownerExists(owner)
    {
        isOwner[owner] = false;
        for (uint i=0; i<owners.length - 1; i++)
            if (owners[i] == owner) {
                owners[i] = owners[owners.length - 1];
                break;
            }
        owners.length -= 1;
        if (required > owners.length)
            changeRequirement(owners.length);
        emit OwnerRemoval(owner);
    }

    /// @dev Allows to replace an owner with a new owner. Transaction has to be sent by wallet.
    /// @param owner Address of owner to be replaced.
    /// @param newOwner Address of new owner.
    function replaceOwner(address owner, address newOwner)
    public
    onlyWallet
    ownerExists(owner)
    ownerDoesNotExist(newOwner)
    {
        for (uint i=0; i<owners.length; i++)
            if (owners[i] == owner) {
                owners[i] = newOwner;
                break;
            }
        isOwner[owner] = false;
        isOwner[newOwner] = true;
        emit OwnerRemoval(owner);
        emit OwnerAddition(newOwner);
    }

    /// @dev Allows to change the number of required confirmations. Transaction has to be sent by wallet.
    /// @param _required Number of required confirmations.
    function changeRequirement(uint _required)
    public
    onlyWallet
    validRequirement(owners.length, _required)
    {
        required = _required;
        emit RequirementChange(_required);
    }

    /// @dev Allows an owner to submit and confirm a transaction.
    /// @param destination Transaction target address.
    /// @param value Transaction ether value.
    /// @param data Transaction data payload.
    /// @return Returns transaction ID.
    function submitTransaction(address destination, uint value, bytes data) 
    public
    returns (uint transactionId)
    {
        //transaction is considered as minting if no data provided, otherwise it's owner changing transaction
        transactionId = addTransaction(destination, value, data);
        confirmTransaction(transactionId);
    }
    

    /// @dev Allows an owner to confirm a transaction.
    /// @param transactionId Transaction ID.
    function confirmTransaction(uint transactionId)
    public
    ownerExists(msg.sender)
    transactionExists(transactionId)
    notConfirmed(transactionId, msg.sender)
    {
        confirmations[transactionId][msg.sender] = true;
        emit Confirmation(msg.sender, transactionId);
        executeTransaction(transactionId);
    }

    /// @dev Allows an owner to revoke a confirmation for a transaction.
    /// @param transactionId Transaction ID.
    function revokeConfirmation(uint transactionId)
    public
    ownerExists(msg.sender)
    confirmed(transactionId, msg.sender)
    notExecuted(transactionId)
    {
        confirmations[transactionId][msg.sender] = false;
        emit Revocation(msg.sender, transactionId);
    }

    /// @dev Allows an user to burn the token.
    function burn(uint value, bytes data)
    payable
    public
    {
        if (TOMO_FEE_MODE) {
            require(msg.value >= WITHDRAW_FEE_TOMO);  //avoid spamming
            receivingFeeWallet.transfer(WITHDRAW_FEE_TOMO);

            if(msg.value > WITHDRAW_FEE_TOMO) {
                msg.sender.transfer(msg.value.sub(WITHDRAW_FEE_TOMO));
            }

            super._burn(msg.sender, value);
            burnList.push(TokenBurnData({
                value: value,
                burner: msg.sender,
                data: data 
            }));
            emit TokenBurn(burnList.length - 1, msg.sender, value, data);
        } else {
            require(value > WITHDRAW_FEE);  //avoid spamming
            super._burn(msg.sender, value);
            if (WITHDRAW_FEE > 0) {
                super._mint(receivingFeeWallet, WITHDRAW_FEE);
            }
            uint256 burnValue = value.sub(WITHDRAW_FEE);
            burnList.push(TokenBurnData({
                value: burnValue,
                burner: msg.sender,
                data: data 
            }));
            emit TokenBurn(burnList.length - 1, msg.sender, burnValue, data);
        }
    }

    /// @dev Allows anyone to execute a confirmed transaction.
    /// @param transactionId Transaction ID.
    function executeTransaction(uint transactionId)
    public
    ownerExists(msg.sender)
    confirmed(transactionId, msg.sender)
    notExecuted(transactionId)
    {
        if (isConfirmed(transactionId)) {
            Transaction storage txn = transactions[transactionId];
            txn.executed = true;

            // just need multisig for minting - freely burn
            if (txn.data.length == 0) {
                //execute minting transaction
                txn.value = txn.value.sub(DEPOSIT_FEE);
                super._mint(txn.destination, txn.value);
                if (DEPOSIT_FEE > 0) {
                    super._mint(receivingFeeWallet, DEPOSIT_FEE);
                }
                emit Execution(transactionId);
            } else {
                //transaction that alters the owners list
                if (txn.destination.call.value(txn.value)(txn.data))
                    emit Execution(transactionId);
                else {
                    emit ExecutionFailure(transactionId);
                    txn.executed = false;
                }
            }
        }
    }

    /// @dev Returns the confirmation status of a transaction.
    /// @param transactionId Transaction ID.
    /// @return Confirmation status.
    function isConfirmed(uint transactionId)
    public
    constant
    returns (bool)
    {
        uint count = 0;
        for (uint i=0; i<owners.length; i++) {
            if (confirmations[transactionId][owners[i]])
                count += 1;
            if (count == required)
                return true;
        }
    }

    /*
     * Internal functions
     */
    /// @dev Adds a new transaction to the transaction mapping, if transaction does not exist yet.
    /// @param destination Transaction target address.
    /// @param value Transaction ether value.
    /// @param data Transaction data payload.
    /// @return Returns transaction ID.
    function addTransaction(address destination, uint value, bytes data)
    internal
    notNull(destination)
    returns (uint transactionId)
    {
        transactionId = transactionCount;
        transactions[transactionId] = Transaction({
            destination: destination,
            value: value,
            data: data,
            executed: false
        });
        transactionCount += 1;
        emit Submission(transactionId);
    }

    /*
     * Web3 call functions
     */
    /// @dev Returns number of confirmations of a transaction.
    /// @param transactionId Transaction ID.
    /// @return Number of confirmations.
    function getConfirmationCount(uint transactionId)
    public
    constant
    returns (uint count)
    {
        for (uint i=0; i<owners.length; i++)
            if (confirmations[transactionId][owners[i]])
                count += 1;
    }

    /// @dev Returns total number of transactions after filers are applied.
    /// @param pending Include pending transactions.
    /// @param executed Include executed transactions.
    /// @return Total number of transactions after filters are applied.
    function getTransactionCount(bool pending, bool executed)
    public
    constant
    returns (uint count)
    {
        for (uint i=0; i<transactionCount; i++)
            if (   pending && !transactions[i].executed
            || executed && transactions[i].executed)
                count += 1;
    }

    /// @dev Returns list of owners.
    /// @return List of owner addresses.
    function getOwners()
    public
    constant
    returns (address[])
    {
        return owners;
    }

    /// @dev Returns array with owner addresses, which confirmed transaction.
    /// @param transactionId Transaction ID.
    /// @return Returns array of owner addresses.
    function getConfirmations(uint transactionId)
    public
    constant
    returns (address[] _confirmations)
    {
        address[] memory confirmationsTemp = new address[](owners.length);
        uint count = 0;
        uint i;
        for (i=0; i<owners.length; i++)
            if (confirmations[transactionId][owners[i]]) {
                confirmationsTemp[count] = owners[i];
                count += 1;
            }
        _confirmations = new address[](count);
        for (i=0; i<count; i++)
            _confirmations[i] = confirmationsTemp[i];
    }

    /// @dev Returns list of transaction IDs in defined range.
    /// @param from Index start position of transaction array.
    /// @param to Index end position of transaction array.
    /// @param pending Include pending transactions.
    /// @param executed Include executed transactions.
    /// @return Returns array of transaction IDs.
    function getTransactionIds(uint from, uint to, bool pending, bool executed)
    public
    constant
    returns (uint[] _transactionIds)
    {
        uint end = to > transactionCount? transactionCount: to;
        uint[] memory transactionIdsTemp = new uint[](end - from);
        uint count = 0;
        uint i;
        for (i = from; i < to; i++) {
            if ((pending && !transactions[i].executed)
                || (executed && transactions[i].executed))
            {
                transactionIdsTemp[count] = i;
                count += 1;
            }
        }
        _transactionIds = new uint[](count);
        for (i = 0; i < count; i++)
            _transactionIds[i] = transactionIdsTemp[i];
    }
    
    function getBurnCount() public view returns (uint256) {
        return burnList.length;
    }

    function getBurn(uint burnId) public view returns (address _burner, uint256 _value, bytes _data) {
        _burner = burnList[burnId].burner;
        _value = burnList[burnId].value;
        _data = burnList[burnId].data;
    }
}
