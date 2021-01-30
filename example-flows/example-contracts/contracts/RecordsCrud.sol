pragma solidity >=0.4.22 <0.8.0;

// SolidityCRUD is a generalized pattern for storing table-like records in an Ethereum blockchain.
// Developed by Rob Hitchens and published at https://bitbucket.org/rhitchens2/soliditycrud/src/master/
// This contract adapts this pattern to CRUD arbitrary byte data records.

contract RecordsCrud {

    struct RecordStruct {
        uint index;
        uint timestamp;
        bytes data;
    }

    mapping(address => RecordStruct) private recordStructs;

    address[] private recordIndex;

    event LogNewRecord(
        address indexed recordAddress,
        uint index,
        uint timestamp,
        bytes data);

    event LogUpdateRecord(
        address indexed recordAddress,
        uint index,
        uint timestamp,
        bytes data);

    event LogDeleteRecord(
        address indexed recordAddress,
        uint index);

    function isRecord(address recordAddress)
    public
    view
    returns(bool isIndeed)
    {
        if(recordIndex.length == 0) {
            return false;
        }

        return (recordIndex[recordStructs[recordAddress].index] == recordAddress);
    }

    function insertRecord(address recordAddress, uint timestamp, bytes memory data)
    public
    returns(uint index)
    {
        require(!isRecord(recordAddress), "Set already contains this record.");
        recordIndex.push(recordAddress);
        recordStructs[recordAddress].index = recordIndex.length - 1;
        recordStructs[recordAddress].timestamp = timestamp;
        recordStructs[recordAddress].data = data;

        emit LogNewRecord(
            recordAddress,
            recordStructs[recordAddress].index,
            timestamp,
            data);

        return recordIndex.length-1;
    }

    function deleteRecord(address recordAddress)
    public
    returns(uint index)
    {
        require(isRecord(recordAddress), "Set does not contain this record.");
        uint rowToDelete = recordStructs[recordAddress].index;
        address keyToMove = recordIndex[recordIndex.length-1];
        recordIndex[rowToDelete] = keyToMove;
        recordStructs[keyToMove].index = rowToDelete;
        recordIndex.pop();

        emit LogDeleteRecord(
            recordAddress,
            rowToDelete);

        emit LogUpdateRecord(
            keyToMove,
            rowToDelete,
            recordStructs[keyToMove].timestamp,
            recordStructs[keyToMove].data);

        return rowToDelete;
    }

    function getRecord(address recordAddress)
    public
    view
    returns(uint index, uint timestamp, bytes memory data)
    {
        require(isRecord(recordAddress), "Set does not contain this record.");

        return(
        recordStructs[recordAddress].index,
        recordStructs[recordAddress].timestamp,
        recordStructs[recordAddress].data);
    }

    function updateRecord(address recordAddress, uint timestamp, bytes memory data)
    public
    returns(bool success)
    {
        require(isRecord(recordAddress), "Set does not contain this record.");
        recordStructs[recordAddress].timestamp = timestamp;
        recordStructs[recordAddress].data = data;

        emit LogUpdateRecord(
            recordAddress,
            recordStructs[recordAddress].index,
            timestamp,
            data);

        return true;
    }

    function getRecordCount()
    public
    view
    returns(uint count)
    {
        return recordIndex.length;
    }

    function getRecordAtIndex(uint index)
    public
    view
    returns(address recordAddress)
    {
        return recordIndex[index];
    }
}