const mongoose = require('mongoose');

const Trade = mongoose.model('Trade');

exports.addTrade = async (req, res) => {
  const { tradingSymbol, transactionType, quantity, price, exchange } = req.body;
  const trade = new Trade({
    tradingSymbol,
    transactionType,
    quantity,
    price,
    exchange,
  });
  const result = await trade.save();
  res.json(result);
};

exports.removeTrade = async (req, res) => {
  const { id } = req.params;
  const result = await Trade.findOne({ _id: id });
  if (!result) { return res.json(); }
  await result.remove();
  // since remove won't trigger post save hooks. we have to do this explicitily.
  await Trade.updateStock(result.tradingSymbol);
  return res.json();
};

exports.updateTrade = async (req, res) => {
  const { id } = req.params;
  const { tradingSymbol, quantity, price, transactionType } = req.body;
  const trade = await Trade.findOne({ _id: id });
  trade.tradingSymbol = tradingSymbol;
  trade.transactionType = transactionType;
  trade.quantity = quantity;
  trade.price = price;
  const result = await trade.save();
  return res.json(result);
};
