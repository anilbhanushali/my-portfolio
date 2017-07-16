/* eslint no-unused-vars: 0 */  // --> OFF

const promisify = require('es6-promisify');
const request = promisify(require('request'));
const jsonParser = require('json-parser');

// Dump is a handy debugging function we can use to sort of "console.log" our data
exports.dump = obj => JSON.stringify(obj, null, 2);

// Get last trade price of a stock
exports.ltp = async (tradingSymbol, exchange = 'NSE') => {
  const url = `https://www.google.com/finance/info?q=${exchange}:${tradingSymbol}`;
  const { error, response, body } = await request(url);
  // Parse the body to JSON and convert the price to float
  return parseFloat(jsonParser.parse(body, null, true).l_fix);
};
