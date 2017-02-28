'use strict';

const express = require('express');

const app = express();
app.use('/public', express.static('public'));

app.set('view engine', 'pug');
app.set('views', __dirname + '/views');

require('./routes.js')(app, require('express-ws')(app));

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});