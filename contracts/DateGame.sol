// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import "@coti-io/coti-contracts/contracts/utils/mpc/MpcCore.sol";

contract DateGame {
    // Store age as gtUint64 (encrypted in MPC domain)
    gtUint64 private _date;
    bool private _dateSet;
    
    // Events to capture comparison results
    event ComparisonResult(string operation, bool result);
    event AgeStored(string message);
    
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
        
        // Store the encrypted value in MPC domain
        _date = gtAge;
        _dateSet = true;
        
        // Emit event
        emit AgeStored("Age stored successfully");
    }

    /**
     * @notice Compares the stored age with an incoming encrypted age value and returns true if stored age > incoming age
     * @param value encrypted input (itUint64) coming from user representing an age to compare
     */
    function greaterThan(itUint64 calldata value) external returns (bool) {
        require(_dateSet, "No age has been stored yet");
        
        gtUint64 incomingGt = MpcCore.validateCiphertext(value);
        
        // Use MPC encrypted comparison - compare encrypted values directly
        gtBool gtResult = MpcCore.gt(_date, incomingGt);
        
        // Convert gtBool to gtUint8: if gtResult then 1 else 0
        gtUint8 one = MpcCore.setPublic8(1);
        gtUint8 zero = MpcCore.setPublic8(0);
        gtUint8 gtUint8Result = MpcCore.mux(gtResult, one, zero);
        
        // Decrypt the uint8 result
        uint8 uintResult = MpcCore.decrypt(gtUint8Result);
        bool result = uintResult != 0;
        
        // Emit event with the result
        emit ComparisonResult("greaterThan", result);
        
        return result;
    }

    /**
     * @notice Compares the stored age with an incoming encrypted age value and returns true if stored age < incoming age
     * @param value encrypted input (itUint64) coming from user representing an age to compare
     */
    function lessThan(itUint64 calldata value) external returns (bool) {
        require(_dateSet, "No age has been stored yet");
        
        gtUint64 incomingGt = MpcCore.validateCiphertext(value);
        
        // Use MPC encrypted comparison - compare encrypted values directly
        gtBool gtResult = MpcCore.lt(_date, incomingGt);
        
        // Convert gtBool to gtUint8: if gtResult then 1 else 0
        gtUint8 one = MpcCore.setPublic8(1);
        gtUint8 zero = MpcCore.setPublic8(0);
        gtUint8 gtUint8Result = MpcCore.mux(gtResult, one, zero);
        
        // Decrypt the uint8 result
        uint8 uintResult = MpcCore.decrypt(gtUint8Result);
        bool result = uintResult != 0;
        
        // Emit event with the result
        emit ComparisonResult("lessThan", result);
        
        return result;
    }

}