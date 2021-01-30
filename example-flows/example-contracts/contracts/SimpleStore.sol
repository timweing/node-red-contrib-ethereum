pragma solidity >=0.4.22 <0.8.0;

import "./Counter.sol";

contract SimpleStore {

    // Public state variable
    bool public publicBool;

    // bool
    bool private myBool;

    function setMyBool(bool value) public
    {
        myBool = value;
    }

    function getMyBool() public view returns(bool value)
    {
        return myBool;
    }

    // int
    int private myInt;

    function setMyInt(int value) public
    {
        myInt = value;
    }

    function getMyInt() public view returns(int value)
    {
        return myInt;
    }

    // uint
    uint private myUint;

    function setMyUint(uint value) public
    {
        myUint = value;
    }

    function getMyUint() public view returns(uint value)
    {
        return myUint;
    }

    // enum
    enum MyEnum{ FIRST, SECOND, THIRD }

    MyEnum private myEnum;

    function setMyEnum(MyEnum value) public
    {
        myEnum = value;
    }

    function getMyEnum() public view returns(MyEnum value)
    {
        return myEnum;
    }

    // address
    address private myAddress;

    function setMyAddress(address value) public
    {
        myAddress = value;
    }

    function getMyAddress() public view returns(address value)
    {
        return myAddress;
    }

    // bytes32 (fixed size byte array)
    bytes32 private myBytes32;

    function setMyBytes32(bytes32 value) public
    {
        myBytes32 = value;
    }

    function getMyBytes32() public view returns(bytes32 value)
    {
        return myBytes32;
    }

    // bytes (dynamic size byte array)
    bytes private myBytes;

    function setMyBytes(bytes memory value) public
    {
        myBytes = value;
    }

    function getMyBytes() public view returns(bytes memory value)
    {
        return myBytes;
    }

    // string (dynamic size byte array)
    string private myString;

    function setMyString(string memory value) public
    {
        myString = value;
    }

    function getMyString() public view returns(string memory value)
    {
        return myString;
    }

    // fixed size int array
    int[5] private fixedIntArray;

    function setFixedIntArray(int[5] memory value) public
    {
        fixedIntArray = value;
    }

    function getFixedIntArray() public view returns(int[5] memory value)
    {
        return fixedIntArray;
    }

    // dynamic size int array
    int[] private dynamicIntArray;

    function setDynamicIntArray(int[] memory value) public
    {
        dynamicIntArray = value;
    }

    function getDynamicIntArray() public view returns(int[] memory value)
    {
        return dynamicIntArray;
    }

    // Contract
    Counter private myCounter;

    function setMyCounter(Counter counter) public
    {
        myCounter = counter;
    }

    function getMyCounter() public view returns(Counter counter)
    {
        return myCounter;
    }

    // Multiple variables
    bool private boolPart;
    int private intPart;
    string private stringPart;

    function setMultipleVariables(bool boolValue, int intValue, string memory stringValue) public
    {
        boolPart = boolValue;
        intPart = intValue;
        stringPart = stringValue;
    }

    function getMultipleVariables() public view returns(bool boolValue, int intValue, string memory stringValue)
    {
        return (boolPart, intPart, stringPart);
    }
}
