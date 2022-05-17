const crypto = require('crypto');
const config = require('./../config');
const helpers = {};
helpers.hash = (str) => {
 if (typeof str === 'string' && str.length > 0) {
  const hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
  return hash;
 } else {
  return false;
 }
};

helpers.parseJsonToObject = (payload) => {
 try {
  const payloadObj = JSON.parse(payload);
  return payloadObj;
 } catch (err) {
  return {};
 }
};
helpers.createRandomString = (strLength) => {
 strLength = typeof strLength === 'number' && strLength > 0 ? strLength : false;
 if (strLength) {
  // define all the possible characters that could go into the string
  const possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let str = '';
  for (let i = 1; i <= strLength; i++) {
   const randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
   str += randomCharacter;
  }
  return str;
 } else {
  return false;
 }
};
module.exports = helpers;
