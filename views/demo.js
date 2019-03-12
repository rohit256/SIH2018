
var express = require('express');
var app = express();

app.set('view engine','ejs');
app.set('views','/.views');

app.listen(7000);
console.log('Running Express...');
