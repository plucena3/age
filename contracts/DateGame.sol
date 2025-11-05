// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import "@coti-io/coti-contracts/contracts/utils/mpc/MpcCore.sol";

contract DateGame {
    // Store age as gtUint64 (encrypted in MPC domain)
    gtUint64 private _date;
    bool private _dateSet;
    
    // Events to capture comparison results - emit encrypted result for user to decrypt off-chain
    event ComparisonResult(string operation, ctBool userEncryptedResult);
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
    function greaterThan(itUint64 calldata value) external returns (ctBool) {
        require(_dateSet, "No age has been stored yet");
        
        gtUint64 incomingGt = MpcCore.validateCiphertext(value);
        
        // Use MPC encrypted comparison - compare encrypted values directly
        gtBool gtResult = MpcCore.gt(_date, incomingGt);
        
        // Encrypt result for user to decrypt off-chain
        ctBool userEncryptedResult = MpcCore.offBoardToUser(gtResult, msg.sender);
        
        // Emit event with the encrypted result
        emit ComparisonResult("greaterThan", userEncryptedResult);
        
        return userEncryptedResult;
    }

    /**
     * @notice Compares the stored age with an incoming encrypted age value and returns true if stored age < incoming age
     * @param value encrypted input (itUint64) coming from user representing an age to compare
     */
    function lessThan(itUint64 calldata value) external returns (ctBool) {
        require(_dateSet, "No age has been stored yet");
        
        gtUint64 incomingGt = MpcCore.validateCiphertext(value);
        
        // Use MPC encrypted comparison - compare encrypted values directly
        gtBool gtResult = MpcCore.lt(_date, incomingGt);
        
        // Encrypt result for user to decrypt off-chain
        ctBool userEncryptedResult = MpcCore.offBoardToUser(gtResult, msg.sender);
        
        // Emit event with the encrypted result
        emit ComparisonResult("lessThan", userEncryptedResult);
        
        return userEncryptedResult;
    }

}