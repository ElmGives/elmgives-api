'use strict';

const tape = require('tape');
const calcFee = require('../../../monthly/calcFee');

tape('Calc fee helper', test => {
    test.plan(2);
    
    let amount = 5.00;
    let isAchPayment = true;
    
    let expected = 0.04;
    let actual = calcFee(amount, isAchPayment);
    
    test.equal(actual, expected, 'Should return the fee based on an ACH payment');
    
    isAchPayment = false;
    expected = 0.445;
    actual = calcFee(amount, isAchPayment);
    
    test.equal(actual, expected, 'Should return the fee based on a credit card payment');
});