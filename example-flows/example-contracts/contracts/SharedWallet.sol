pragma solidity >=0.6.0 <0.8.0;

contract SharedWallet {
    mapping(address => bool) private owners;

    constructor(address[] memory _owners) public {
        for(uint256 i = 0; i < _owners.length; i++) {
            owners[_owners[i]] = true;
        }
    }

    event Deposit(address indexed from, uint256 amount);
    event Withdraw(address indexed to, uint256 amount);

    function getBalance() external view returns(uint256) {
        require(owners[msg.sender], "Only shared wallet owners can read the balance.");
        return address(this).balance;
    }

    function deposit() external payable {
        emit Deposit(msg.sender, msg.value);
    }

    function withdraw(uint256 amount) external {
        require(owners[msg.sender], "Only shared wallet owners can withdraw.");
        require(amount <= address(this).balance, "Not enough balance.");
        payable(msg.sender).transfer(amount);
        emit Withdraw(msg.sender, amount);
    }
}
