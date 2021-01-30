// This oracle is a slight adaption of the following sources:
// Tutorial: https://medium.com/@pedrodc/implementing-a-blockchain-oracle-on-ethereum-cedc7e26b49e
// Code Source: https://github.com/pedroduartecosta/blockchain-oracle/tree/master/on-chain-oracle

pragma solidity >=0.6.0 <0.8.0;

import "../../erc20-dependency/IERC20.sol";

contract CoinPriceOracle {
    address platformOwner;
    IERC20 token;
    uint currentId = 0; //increasing request id
    mapping (uint => Request) requests; //mapping of requests made to the contract
    uint minQuorum = 2; //minimum number of responses to receive before declaring final result
    uint totalOracleCount = 3; // Hardcoded oracle count

    // defines a general api request
    struct Request {
        uint id;                            // request id
        uint coinId;                      // Coin Id
        string agreedPriceUsd;              // The agreed price in USD
        mapping(uint => string) answers;    // answers provided by the oracles
        mapping(address => uint) quorum;    // oracles which will query the answer (1=oracle hasn't voted, 2=oracle has voted)
    }

    //event that triggers oracle outside of the blockchain
    event NewRequest (
        uint indexed id,
        uint indexed coinId
    );

    //triggered when there's a consensus on the final result
    event UpdatedRequest (
        uint indexed id,
        uint indexed coinId,
        string agreedPriceUsd
    );

    constructor(IERC20 _token) public {
        platformOwner = msg.sender;
        token = _token;
    }

    function createRequest (
        uint _coinId
    )
    public
    {
        // First collect 1 token for request
        uint256 allowance = token.allowance(msg.sender, address(this));
        require(allowance >= 1000000000000000000, "Not enough request tokens approved to oracle contract");
        token.transferFrom(msg.sender, platformOwner, 1000000000000000000);

        Request storage r = requests[currentId];
        r.id = currentId;
        r.coinId = _coinId;
        r.agreedPriceUsd = "";

        // Hardcoded trusted oracle addresses
        r.quorum[address(0xc47283Dc3A778D863ECc83fa30eC09C3BA339a93)] = 1; // Account 4
        r.quorum[address(0x4510D109CA0B7fA54977E9aEBDa4Fad66AeB8802)] = 1; // Account 5
        r.quorum[address(0x58aFcB861205ef496a90b9dFB9A30714f995967F)] = 1; // Account 6

        // launch an event to be detected by oracle outside of blockchain
        emit NewRequest (
            currentId,
            _coinId
        );

        // increase request id
        currentId++;
    }

    //called by the oracle to record its answer
    function updateRequest (
        uint _id,
        string memory _priceRetrievedUsd
    ) public {

        Request storage currRequest = requests[_id];

        //check if oracle is in the list of trusted oracles
        //and if the oracle hasn't voted yet
        if(currRequest.quorum[address(msg.sender)] == 1){

            //marking that this address has voted
            currRequest.quorum[msg.sender] = 2;

            //iterate through "array" of answers until a position if free and save the retrieved value
            uint tmpI = 0;
            bool found = false;
            while(!found) {
                //find first empty slot
                if(bytes(currRequest.answers[tmpI]).length == 0){
                    found = true;
                    currRequest.answers[tmpI] = _priceRetrievedUsd;
                }
                tmpI++;
            }

            uint currentQuorum = 0;

            //iterate through oracle list and check if enough oracles(minimum quorum)
            //have voted the same answer has the current one
            for(uint i = 0; i < totalOracleCount; i++){
                bytes memory a = bytes(currRequest.answers[i]);
                bytes memory b = bytes(_priceRetrievedUsd);

                if(keccak256(a) == keccak256(b)){
                    currentQuorum++;
                    if(currentQuorum >= minQuorum){
                        currRequest.agreedPriceUsd = _priceRetrievedUsd;
                        emit UpdatedRequest (
                            currRequest.id,
                            currRequest.coinId,
                            currRequest.agreedPriceUsd
                        );
                    }
                }
            }
        }
    }
}
