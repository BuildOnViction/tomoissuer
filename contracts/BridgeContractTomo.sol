pragma solidity ^0.6.0;

/**
 * @title Roles
 * @dev Library for managing addresses assigned to a Role.
 */
library Roles {
  struct Role {
    mapping (address => bool) bearer;
  }

  /**
   * @dev give an account access to this role
   */
  function add(Role storage role, address account) internal {
    require(account != address(0));
    require(!has(role, account));

    role.bearer[account] = true;
  }

  /**
   * @dev remove an account's access to this role
   */
  function remove(Role storage role, address account) internal {
    require(account != address(0));
    require(has(role, account));

    role.bearer[account] = false;
  }

  /**
   * @dev check if an account has this role
   * @return bool
   */
  function has(Role storage role, address account)
    internal
    view
    returns (bool)
  {
    require(account != address(0));
    return role.bearer[account];
  }
}

pragma solidity ^0.6.0;

/*
 * @dev Provides information about the current execution context, including the
 * sender of the transaction and its data. While these are generally available
 * via msg.sender and msg.data, they should not be accessed in such a direct
 * manner, since when dealing with GSN meta-transactions the account sending and
 * paying for execution may not be the actual sender (as far as an application
 * is concerned).
 *
 * This contract is only required for intermediate, library-like contracts.
 */
abstract contract Context {
    function _msgSender() internal view virtual returns (address payable) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes memory) {
        this; // silence state mutability warning without generating bytecode - see https://github.com/ethereum/solidity/issues/2691
        return msg.data;
    }
}

pragma solidity ^0.6.0;

/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * By default, the owner account will be the one that deploys the contract. This
 * can later be changed with {transferOwnership}.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyOwner`, which can be applied to your functions to restrict their use to
 * the owner.
 */
contract Ownable is Context {
    address private _owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Initializes the contract setting the deployer as the initial owner.
     */
    constructor () internal {
        address msgSender = _msgSender();
        _owner = msgSender;
        emit OwnershipTransferred(address(0), msgSender);
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        require(_owner == _msgSender(), "Ownable: caller is not the owner");
        _;
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions anymore. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby removing any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        emit OwnershipTransferred(_owner, address(0));
        _owner = address(0);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        emit OwnershipTransferred(_owner, newOwner);
        _owner = newOwner;
    }
}

pragma solidity ^0.6.0;

contract OperatorRole {
    using Roles for Roles.Role;
    
    event SubmitterAdded(address indexed account);
	event SubmitterRemoved(address indexed account);

	event VerifierAdded(address indexed account);
	event VerifierRemoved(address indexed account);
	
	Roles.Role private submitters;
	Roles.Role private verifiers;
	
	modifier onlySubmitter() {
		require(isSubmitter(msg.sender));
		_;
	}
	
	modifier onlyVerifier() {
		require(isVerifier(msg.sender));
		_;
	}
	
	function isSubmitter(address account) public view returns (bool) {
		return submitters.has(account);
	}
	
	function isVerifier(address account) public view returns (bool) {
		return verifiers.has(account);
	}

	function _addSubmitter(address account) internal {
		submitters.add(account);
		emit SubmitterAdded(account);
	}

	function _removeSubmitter(address account) internal {
		submitters.remove(account);
		emit SubmitterRemoved(account);
	}
	
	function _addVerifier(address account) internal {
		verifiers.add(account);
		emit VerifierAdded(account);
	}

	function _removeVerifier(address account) internal {
		verifiers.remove(account);
		emit VerifierRemoved(account);
	}
	
}

pragma solidity ^0.6.0;

contract Pausable is Context {
    /**
     * @dev Emitted when the pause is triggered by `account`.
     */
    event Paused(address account);

    /**
     * @dev Emitted when the pause is lifted by `account`.
     */
    event Unpaused(address account);

    bool private _paused;

    /**
     * @dev Initializes the contract in unpaused state.
     */
    constructor () internal {
        _paused = false;
    }

    /**
     * @dev Returns true if the contract is paused, and false otherwise.
     */
    function paused() public view returns (bool) {
        return _paused;
    }

    /**
     * @dev Modifier to make a function callable only when the contract is not paused.
     *
     * Requirements:
     *
     * - The contract must not be paused.
     */
    modifier whenNotPaused() {
        require(!_paused, "Pausable: paused");
        _;
    }

    /**
     * @dev Modifier to make a function callable only when the contract is paused.
     *
     * Requirements:
     *
     * - The contract must be paused.
     */
    modifier whenPaused() {
        require(_paused, "Pausable: not paused");
        _;
    }

    /**
     * @dev Triggers stopped state.
     *
     * Requirements:
     *
     * - The contract must not be paused.
     */
    function _pause() internal virtual whenNotPaused {
        _paused = true;
        emit Paused(_msgSender());
    }

    /**
     * @dev Returns to normal state.
     *
     * Requirements:
     *
     * - The contract must be paused.
     */
    function _unpause() internal virtual whenPaused {
        _paused = false;
        emit Unpaused(_msgSender());
    }
}

pragma solidity ^0.6.0;

library ECDSA {
    /**
     * @dev Returns the address that signed a hashed message (`hash`) with
     * `signature`. This address can then be used for verification purposes.
     *
     * The `ecrecover` EVM opcode allows for malleable (non-unique) signatures:
     * this function rejects them by requiring the `s` value to be in the lower
     * half order, and the `v` value to be either 27 or 28.
     *
     * IMPORTANT: `hash` _must_ be the result of a hash operation for the
     * verification to be secure: it is possible to craft signatures that
     * recover to arbitrary addresses for non-hashed data. A safe way to ensure
     * this is by receiving a hash of the original message (which may otherwise
     * be too long), and then calling {toEthSignedMessageHash} on it.
     */
    function recover(bytes32 hash, bytes memory signature) internal pure returns (address) {
        // Check the signature length
        if (signature.length != 65) {
            revert("ECDSA: invalid signature length");
        }

        // Divide the signature in r, s and v variables
        bytes32 r;
        bytes32 s;
        uint8 v;

        // ecrecover takes the signature parameters, and the only way to get them
        // currently is to use assembly.
        // solhint-disable-next-line no-inline-assembly
        assembly {
            r := mload(add(signature, 0x20))
            s := mload(add(signature, 0x40))
            v := byte(0, mload(add(signature, 0x60)))
        }

        // EIP-2 still allows signature malleability for ecrecover(). Remove this possibility and make the signature
        // unique. Appendix F in the Ethereum Yellow paper (https://ethereum.github.io/yellowpaper/paper.pdf), defines
        // the valid range for s in (281): 0 < s < secp256k1n ÷ 2 + 1, and for v in (282): v ∈ {27, 28}. Most
        // signatures from current libraries generate a unique signature with an s-value in the lower half order.
        //
        // If your library generates malleable signatures, such as s-values in the upper range, calculate a new s-value
        // with 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141 - s1 and flip v from 27 to 28 or
        // vice versa. If your library also generates signatures with 0/1 for v instead 27/28, add 27 to v to accept
        // these malleable signatures as well.
        if (uint256(s) > 0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF5D576E7357A4501DDFE92F46681B20A0) {
            revert("ECDSA: invalid signature 's' value");
        }

        if (v != 27 && v != 28) {
            revert("ECDSA: invalid signature 'v' value");
        }

        // If the signature is valid (and not malleable), return the signer address
        address signer = ecrecover(hash, v, r, s);
        require(signer != address(0), "ECDSA: invalid signature");

        return signer;
    }

    /**
     * @dev Returns an Ethereum Signed Message, created from a `hash`. This
     * replicates the behavior of the
     * https://github.com/ethereum/wiki/wiki/JSON-RPC#eth_sign[`eth_sign`]
     * JSON-RPC method.
     *
     * See {recover}.
     */
    function toEthSignedMessageHash(bytes32 hash) internal pure returns (bytes32) {
        // 32 is the length in bytes of hash,
        // enforced by the type signature above
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
    }
}

pragma solidity ^0.6.0;

contract BridgeContract is Ownable, Pausable, OperatorRole {
    /*
     *  Events
     */
    event OwnerWithdraw(address indexed token, address indexed recipient, uint amount);
    event SubmitBurningTx(bytes32 txHash);
    event SignBurningTx(bytes32 txHash, address recipient, uint256 value, bytes signature);
    event AddedBlackList(address _address);
    event RemovedBlackList(address _address);
    
    struct Transaction {
        bool signed;
        address recipient;
        address tokenAddress;
        bool isAvailable;
        uint256 amount; 
        uint256 nonce;
        uint target_chain;
    }

    mapping (address => bool) public isAddressBlackListed;
    mapping (address => bool) public isTokenBlackListed;

    mapping(bytes32 => Transaction) public Transactions;

    uint256 public nonce;

    constructor(address submitter, address verifier) public {
        _addSubmitter(submitter);
        _addVerifier(verifier);
    }

    /*
     *  Modifiers
     */
    modifier nonExisted(bytes32 txHash) {
        require(!Transactions[txHash].isAvailable, "Tx is existed");
        _;
    }
    
    modifier nonSigned(bytes32 txHash) {
        require(!Transactions[txHash].signed, 'Tx is signed');
        _;
    }

    // Submitter and verifier
    function addSubmitter(address account) public onlyOwner {
		_addSubmitter(account);
	}
	
	function removeSubmitter(address account) public onlyOwner {
		_removeSubmitter(account);
	}
	
	
	function addVerifier(address account) public onlyOwner {
		_addVerifier(account);
	}
	
	function removeVerifier(address account) public onlyOwner {
		_removeVerifier(account);
	}
    
    // Pause/unpause contract
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
    
    // Blacklist
    function addTokenBlackList (address _token) public onlyOwner {
        isTokenBlackListed[_token] = true;
        emit AddedBlackList(_token);
    }

    function removeTokenBlackList (address _token) public onlyOwner {
        delete isTokenBlackListed[_token];
        emit RemovedBlackList(_token);
    }
    
    function addAddressBlackList (address _address) public onlyOwner {
        isAddressBlackListed[_address] = true;
        emit AddedBlackList(_address);
    }

    function removeAddressBlackList (address _address) public onlyOwner {
        delete isAddressBlackListed[_address];
        emit RemovedBlackList(_address);
    }

    // Submit and sign tx
    function submitBurningTX(address token, address recipient, uint amount, bytes32  txHash, uint target_chain) external onlySubmitter nonExisted(txHash) returns (uint256 transactionId) {
        require(!isTokenBlackListed[token], "Token blacklisted");
        require(!isAddressBlackListed[recipient], "Recipient blacklisted");
        require(!isAddressBlackListed[msg.sender], "Sedner blacklisted");
        Transactions[txHash] = Transaction({
            tokenAddress: token,
            recipient: recipient,
            amount: amount,
            nonce: nonce,
            signed: false,
            isAvailable: true,
            target_chain: target_chain
        });
        
        transactionId = nonce;
        nonce++;
        
        emit SubmitBurningTx(txHash);    
    }
    
    function signBuringTX(bytes32 txHash, bytes calldata signature) external onlyVerifier whenNotPaused nonSigned(txHash) {
        require(!isTokenBlackListed[Transactions[txHash].tokenAddress], "Token blacklisted");
        require(!isAddressBlackListed[msg.sender], "Sedner blacklisted");
        require(!isAddressBlackListed[Transactions[txHash].recipient], "Recipient blacklisted");
        bytes32 message = keccak256(abi.encodePacked(
            Transactions[txHash].tokenAddress,
            txHash,
            Transactions[txHash].recipient,
            Transactions[txHash].nonce,
            Transactions[txHash].amount,
            Transactions[txHash].target_chain
        ));
        bytes32 hash = ECDSA.toEthSignedMessageHash(message);
        address signer = ECDSA.recover(hash, signature);
        require(this.isVerifier(signer), 'Invalid signature');

        Transactions[txHash].signed = true;
        emit SignBurningTx(txHash, Transactions[txHash].recipient, Transactions[txHash].amount, signature);
    }
}
