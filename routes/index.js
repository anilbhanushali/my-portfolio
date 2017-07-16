const express = require('express');

const router = express.Router();
const tradeController = require('../controllers/tradeController');
const stockController = require('../controllers/stockController');

const { catchErrors } = require('../handlers/errorHandlers');

router.get('/', catchErrors(stockController.getLastTradePrice));

router.get('/portfolio', catchErrors(stockController.getPorfolio));
router.get('/portfolio/holdings', catchErrors(stockController.getHoldings));
router.get('/portfolio/returns/:tradingSymbol', catchErrors(stockController.getReturns));

router.post('/portfolio/addTrade', catchErrors(tradeController.addTrade));
router.post('/portfolio/updateTrade/:id', catchErrors(tradeController.updateTrade));
router.post('/portfolio/removeTrade/:id', catchErrors(tradeController.removeTrade));

module.exports = router;
