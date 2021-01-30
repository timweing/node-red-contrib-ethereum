pragma solidity >=0.4.22 <0.8.0;

contract Counter {
    int private count = 0;
    
    function increment() public {
        count += 1;
    }

    function decrement() public {
        require(count > 0, "Counter can't go below 0.");
        count -= 1;
    }

    function reset() public {
        count = 0;
    }

    function getCount() public view returns (int) {
        return count;
    }
}
