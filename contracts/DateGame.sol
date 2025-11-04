// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import "@coti-io/coti-contracts/contracts/utils/mpc/MpcCore.sol";

contract DateGame {
    // stored date as user-specific ciphertext (for the server wallet)
    utUint64 private _date;
    bool private _dateSet;
    
    // Events to capture comparison results
    event ComparisonResult(string operation, bool result);
    event DateStored(uint64 value);
    
    constructor() {
        _dateSet = false;
    }

    /**
     * @notice Check if a date has been stored
     */
    function isDateSet() external view returns (bool) {
        return _dateSet;
    }

    /**
     * @notice set the stored date value (encrypted user-specific ciphertext)
     * @param value encrypted input (itUint64) coming from user
     */
    function setDate(itUint64 calldata value) external {
        gtUint64 gtValue = MpcCore.validateCiphertext(value);
        // store as user-specific ciphertext for the caller
        _date = MpcCore.offBoardCombined(gtValue, msg.sender);
        _dateSet = true;
        
        // Emit event with the stored value for debugging
        uint64 storedClear = MpcCore.decrypt(gtValue);
        emit DateStored(storedClear);
    }

    /**
     * @notice Compares the stored date with an incoming encrypted value and returns true if stored > value
     * @param value encrypted input (itUint64) coming from user
     */
    function greaterThan(itUint64 calldata value) external returns (bool) {
        require(_dateSet, "No date has been stored yet");
        
        gtUint64 incomingGt = MpcCore.validateCiphertext(value);
        gtUint64 storedGt = MpcCore.onBoard(_date.ciphertext);
        
        // Use MPC's native gt function for encrypted comparison (no decryption needed)
        gtBool gtResult = MpcCore.gt(storedGt, incomingGt);
        bool result = MpcCore.decrypt(gtResult);
        
        // Emit event with the result
        emit ComparisonResult("greaterThan", result);
        
        return result;
    }

    /**
     * @notice Compares the stored date with an incoming encrypted value and returns true if stored < value
     * @param value encrypted input (itUint64) coming from user
     */
    function lessThan(itUint64 calldata value) external returns (bool) {
        require(_dateSet, "No date has been stored yet");
        
        gtUint64 incomingGt = MpcCore.validateCiphertext(value);
        gtUint64 storedGt = MpcCore.onBoard(_date.ciphertext);
        
        // Use MPC's native lt function for encrypted comparison (no decryption needed)
        gtBool ltResult = MpcCore.lt(storedGt, incomingGt);
        bool result = MpcCore.decrypt(ltResult);
        
        // Emit event with the result
        emit ComparisonResult("lessThan", result);
        
        return result;
    }

    /**
     * @notice Get the stored date in clear text (for debugging)
     */
    function getStoredDateClear() external returns (uint64) {
        require(_dateSet, "No date has been stored yet");
        
        gtUint64 storedGt = MpcCore.onBoard(_date.ciphertext);
        uint64 clearValue = MpcCore.decrypt(storedGt);
        emit DateStored(clearValue);
        return clearValue;
    }
}