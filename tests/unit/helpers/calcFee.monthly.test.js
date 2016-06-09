'use strict';

const tape = require('tape');
const calcFee = require('../../../monthly/calcFee');

tape('Calc fee helper', test => {
    test.plan(2);
    
    let amount = 5.00;
    let amountInCents = amount * 100;
    let isAchPayment = true;
    
    let expected = 54;  // (500 * 0.8% + 50) in cents
    let actual = calcFee(amountInCents, isAchPayment);
    
    test.equal(actual, expected, 'Should return the fee based on an ACH payment');
    
    isAchPayment = false;
    expected = 95;      // (500 * 2.9% + 80) in cents
    actual = calcFee(amountInCents, isAchPayment);
    
    test.equal(actual, expected, 'Should return the fee based on a credit card payment');
});