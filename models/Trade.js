const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
const mongodbErrorHandler = require('mongoose-mongodb-errors');

const tradeSchema = new mongoose.Schema({
  tradingSymbol: {
    type: String,
    trim: true,
    required: 'Stock symbol is required',
  },
  exchange: {
    type: String,
    trim: true,
    required: 'Exchange is required',
  },
  transactionType: {
    type: String,
    enum: ['BUY', 'SELL'],
    required: 'Transaction type is required',
  },
  quantity: {
    type: Number,
    required: 'Quantity is required',
  },
  price: {
    type: Number,
    required: 'Quantity is required',
  },
  value: {
    type: Number,
  },
  created: {
    type: Date,
    default: Date.now,
  },
});

tradeSchema.pre('save', async function tradePreSave(next) {
  this.value = this.price * this.quantity;
  if (this.transactionType === 'SELL') {
    try {
      await this.constructor.checkQuantity(this.tradingSymbol, this.quantity);
    } catch (err) {
      return next(err);
    }
  }
  return next();
});

tradeSchema.post('save', async function tradePostSave({ tradingSymbol }) {
  await this.constructor.updateStock(tradingSymbol);
});

tradeSchema.statics.updateStock = async function updateStock(tradingSymbol) {
  const [result] = await this.getPosition(tradingSymbol);
  const { quantity: quantityAvailable } = result;
  let { averagePrice } = result;
  averagePrice = (Math.round(averagePrice * 100) / 100);

  const value = quantityAvailable * averagePrice;
  const Stock = mongoose.model('Stock');
  await Stock.update({
    tradingSymbol,
  }, {
    $set: {
      quantityAvailable,
      averagePrice,
      value,
    },
  }, {
    upsert: true,
  });
};

tradeSchema.statics.getPosition = function getPosition(tradingSymbol) {
  const query = [];

  if (tradingSymbol) {
    query.push({
      $match: { tradingSymbol },
    });
  }

  return this.aggregate(
    [
      ...query,
      {
        $project: {
          tradingSymbol: '$tradingSymbol',
          buyValue: {
            $cond: [
              { $eq: ['$transactionType', 'BUY'] },
              '$value',
              0,
            ],
          },
          quantity: {
            $cond: [
              { $eq: ['$transactionType', 'SELL'] },
              { $multiply: ['$quantity', -1] },
              '$quantity'],
          },
          buyQuantity: {
            $cond: [
              { $eq: ['$transactionType', 'BUY'] },
              '$quantity', 0],
          },
        },
      },
      {
        $group:
        {
          _id: '$tradingSymbol',
          quantity: { $sum: '$quantity' },
          buyValue: { $sum: '$buyValue' },
          buyQuantity: { $sum: '$buyQuantity' },
        },
      },
      {
        $project: {
          tradingSymbol: '$_id',
          quantity: '$quantity',
          buyValue: '$buyValue',
          averagePrice: {
            $cond: [
              { $gt: ['$quantity', 0] },
              { $divide: ['$buyValue', '$buyQuantity'] },
              0,
            ],
          },
        },
      },
    ]);
};

tradeSchema.statics.checkQuantity = async function checkQuantity(tradingSymbol, quantity) {
  const [stock] = await this.getPosition(tradingSymbol);
  if (!stock || stock.quantity < quantity) {
    throw Error('Cannot short, Quantiy insufficient');
  }
};

tradeSchema.plugin(mongodbErrorHandler);

module.exports = mongoose.model('Trade', tradeSchema);
