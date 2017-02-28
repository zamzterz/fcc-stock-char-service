(function (){
  const colors = randomColor({count: 100});
  const websocket = new WebSocket('wss://' + window.location.host + '/api');
  let stockChart;

  websocket.onmessage = (event) => {
    plotStockData(event.data);
    listStocks(event.data);
  }

  websocket.onopen = (event) => {
    document.getElementById('addStock').className = '';
    document.getElementById('addStockBtn').onclick = () => {
      let stockName = document.getElementById('stockName').value;
      websocket.send('add ' + stockName);
    }
  };

  function plotStockData(stockData) {
    stockData = JSON.parse(stockData);
    const options = {
      responsive: false,
      maintainAspectRatio: false
    };

    let labels = stockData[Object.keys(stockData)[0]].map((entry) => entry.date);
    let datasets = Object.keys(stockData).map((stockSymbol, i) => {
      return {
        label: stockSymbol,
        data: stockData[stockSymbol].map((entry) => entry.closing),
        fill: false,
        lineTension: 0,
        borderColor: colors[i],
        backgroundColor: colors[i]
      }
    });

    const ctx = document.getElementById('stockChart').getContext('2d');
    if (stockChart) {
      stockChart.destroy();
    }
    stockChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: datasets
      },
      options: options
    });
  }

  function listStocks(stockData) {
    const stockListNode = document.getElementById('stockList');
    stockListNode.innerHTML = '';
    for (let key of Object.keys(JSON.parse(stockData))) {
      let elementNode = document.createElement('p');
      elementNode.innerText = key;
      let removeBtn = document.createElement('button');
      removeBtn.value = key;
      removeBtn.innerText = 'x';
      removeBtn.onclick = (e) => { websocket.send('rm ' + e.target.value); };
      elementNode.appendChild(removeBtn);
      stockList.appendChild(elementNode);
    }
  }
})();
