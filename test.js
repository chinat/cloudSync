#!/usr/bin/env node
var express = require('express');
var engines = require('consolidate');

var app = express();
app.engine('haml', engines.haml);
app.engine('html', engines.hogan);

app.use(express.static(__dirname + '/'));

app.get('/', function(req, res){
    res.render('index.html');
});

app.listen(8080);
