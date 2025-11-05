// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import "@coti-io/coti-contracts/contracts/utils/mpc/MpcCore.sol";

contract DateGame {
    // stored age as plaintext (for debugging)
    uint64 private _date;
    bool private _dateSet;
    
    // Events to capture comparison results
    event ComparisonResult(string operation, bool result);
    event AgeStored(uint64 value);
    
    constructor() {
        _dateSet = false;
    }

    /**
     * @notice Check if an age has been stored
     */
    function isDateSet() external view returns (bool) {
        return _dateSet;
    }

    /**
     * @notice set the stored age value directly
     * @param age encrypted input (itUint64) coming from user representing their age in years
     */
    function setAge(itUint64 calldata age) external {
        gtUint64 gtAge = MpcCore.validateCiphertext(age);
        
        // Decrypt and store as plaintext for debugging
        _date = MpcCore.decrypt(gtAge);
        _dateSet = true;
        
        // Emit event with decrypted value
        emit AgeStored(_date);
    }

    /**
     * @notice Compares the stored age with an incoming encrypted age value and returns true if stored age > incoming age
     * @param value encrypted input (itUint64) coming from user representing an age to compare
     */
    function greaterThan(itUint64 calldata value) external returns (bool) {
        require(_dateSet, "No age has been stored yet");
        
        gtUint64 incomingGt = MpcCore.validateCiphertext(value);
        
        // Decrypt incoming value and compare with stored plaintext
        uint64 incomingValue = MpcCore.decrypt(incomingGt);
        bool result = _date > incomingValue;
        
        // Emit event with the result and the decrypted values for debugging
        emit ComparisonResult(
            string(abi.encodePacked("greaterThan: stored=", uint2str(_date), " incoming=", uint2str(incomingValue))), 
            result
        );
        
        return result;
    }
    
    // Helper function to convert uint to string
    function uint2str(uint64 _i) internal pure returns (string memory) {
        if (_i == 0) {
            return "0";
        }
        uint64 j = _i;
        uint len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint64 k = _i;
        while (k != 0) {
            bstr[--len] = bytes1(uint8(48 + k % 10));
            k /= 10;
        }
        return string(bstr);
    }

    /**
     * @notice Compares the stored age with an incoming encrypted age value and returns true if stored age < incoming age
     * @param value encrypted input (itUint64) coming from user representing an age to compare
     */
    function lessThan(itUint64 calldata value) external returns (bool) {
        require(_dateSet, "No age has been stored yet");
        
        gtUint64 incomingGt = MpcCore.validateCiphertext(value);
        
        // Decrypt incoming value and compare with stored plaintext
        uint64 incomingValue = MpcCore.decrypt(incomingGt);
        bool result = _date < incomingValue;
        
        // Emit event with the result and the decrypted values for debugging
        emit ComparisonResult(
            string(abi.encodePacked("lessThan: stored=", uint2str(_date), " incoming=", uint2str(incomingValue))), 
            result
        );
        
        return result;
    }

}