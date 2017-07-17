/* eslint no-unused-vars: 0 */  // --> OFF

const promisify = require('es6-promisify');
const request = require('request');
const jsonParser = require('json-parser');

const makeRequest = promisify(request, request);

// Dump is a handy debugging function we can use to sort of "console.log" our data
exports.dump = obj => JSON.stringify(obj, null, 2);

// Get last trade price of a stock
exports.ltp = async (tradingSymbol, exchange = 'NSE') => {
  try {
    const url = `https://www.google.com/finance/info?q=${exchange}:${tradingSymbol}`;
    const { error, response, body } = await makeRequest(url);
    let jsonResult = {};
    // Parse the body to JSON and convert the price to float
    jsonResult = parseFloat(jsonParser.parse(body, null, true).l_fix);
    return jsonResult;
  } catch (err) {
    throw Error('Error getting last trade price, Please check if Stock Exists.');
  }
};
