'use strict';

const yahooFinance = require('yahoo-finance');
const moment = require('moment');

let stockSymbols = [];

function getStockData(callback) {
  yahooFinance.historical({
    symbols: stockSymbols.slice(),
    from: moment().subtract(30, 'days').format()
  }, function (err, result) {
    if (err) {throw err;}
    let stocks = {};

    for (let key of Object.keys(result)) {
      if (!result[key].length) {
        // remove invalid stock key
        stockSymbols.splice(stockSymbols.indexOf(key), 1);
        continue;
      }
      stocks[key] = result[key].map((data) => {
        return {
          'closing': data.close,
          'date': moment(data.date).format('MMMM D, Y')
        }
      });
    }
    callback(stocks);
  });
}

module.exports = function (app, expressWs) {
	app.route('/')
		.get((req, res) => {
      res.render('index.pug');
		});

  app.ws('/api', function(ws, req) {
    ws.on('message', function(msg) {
      console.log('new message: ' + msg);
      if (msg.startsWith('add')) {
        let stockName = msg.substring(4);
        console.log('new stock added: ' + stockName);
        stockSymbols.push(stockName);
      } else if (msg.startsWith('rm')) {
        let stockName = msg.substring(3);
        console.log('stock removed: ' + stockName)
        stockSymbols.splice(stockSymbols.indexOf(stockName), 1);
      }

      getStockData((stockData) => {
        console.log('broadcasting to all');
        const json = JSON.stringify(stockData);
        expressWs.getWss('/api').clients.forEach((client) => client.send(json));
      });
    });

    console.log('new connection');
    getStockData((stockData) => ws.send(JSON.stringify(stockData)));
  });
};
