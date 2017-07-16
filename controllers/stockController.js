const mongoose = require('mongoose');

const Stock = mongoose.model('Stock');
const h = require('../helpers');

exports.getLastTradePrice = async (req, res) => {
  const result = await h.ltp('NIFTY', 'NSE');
  return res.json(result);
};

exports.getReturns = async (req, res) => {
  const { tradingSymbol } = req.params;
  const stockPromise = Stock.findOne({ tradingSymbol });
  const ltpPromise = h.ltp(tradingSymbol);
  const [stock, ltp] = await Promise.all([stockPromise, ltpPromise]);
  if (!stock) { throw Error('Stock not in portfolio'); }
  const cumulativeReturn = Math.round(
        (ltp - stock.averagePrice) * stock.quantityAvailable * 100)
        / 100;
  return res.json({
    stock,
    return: cumulativeReturn,
  });
};

exports.getHoldings = async (req, res) => {
  const stocks = await Stock.find();
  return res.json(stocks);
};

exports.getPorfolio = async (req, res) => {
  const stocks = await Stock.find().populate('trades');
  return res.json(stocks);
};
