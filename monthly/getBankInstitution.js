'use strict';

const Banks = require('../banks');

/**
 * Finds a bank type based on ID
 * @param {String}    bankId
 * @param {generator} generator
 */
function getBankInstitution(bankId, generator) {
  const query = {
    _id: bankId,
  };
    
  const selector = {
    type: 1,
  };
    
  Banks
    .findOne(query, selector)
    .exec()
    .then(function (bank) {
            
      if (!bank) {
        const error = new Error(`There is no bank with ID ${bankId}`);
        generator.throw(error);
        return;
        }
            
      generator.next(bank.type);
    })
    .catch(generator.throw);
}

module.exports = getBankInstitution;
