const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const stockSchema = new mongoose.Schema({
  tradingSymbol: {
    type: String,
    trim: true,
    required: 'Please enter a stock name!',
  },
  created: {
    type: Date,
    default: Date.now,
  },
  averagePrice: {
    type: Number,
  },
  quantityAvailable: {
    type: Number,
  },
  value: {
    type: Number,
  },
},
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  });

// find trades where the stock's tradingSymbol property === trade's tradingSymbol property
stockSchema.virtual('trades', {
  ref: 'Trade', // what model to link?
  localField: 'tradingSymbol', // which field on the store?
  foreignField: 'tradingSymbol', // which field on the review?
});

stockSchema.pre('save', function stockPreSave(next) {
  this.averagePrice = (this.value / this.quantityAvailable);
  next();
});
// Define our indexes
stockSchema.index({
  tradingSymbol: 'text',
});

module.exports = mongoose.model('Stock', stockSchema);
