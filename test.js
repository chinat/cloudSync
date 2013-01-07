#!/usr/bin/env node
var express = require('express');
var engines = require('consolidate');

var app = express();
app.engine('haml', engines.haml);
app.engine('html', engines.hogan);

app.configure(function(){
    app.use(express.methodOverride());
    app.use(express.bodyParser());
    app.use(app.router);
    app.use(express.static(__dirname + '/'));
});


app.get('/cba', function(req, res){
       res.sendfile('start.html');
});
app.get('*', function(req, res){
   var path = req.params[0];
   if (path === "/abc") {
       res.sendfile('start.html');
   } else if (path === "/123") {
       res.send("abc123");
   } else {
       res.send(req.params);
   }
});

app.listen(8080);
