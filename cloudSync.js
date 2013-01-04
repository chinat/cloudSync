#!/usr/bin/env node
var fs = require("fs"),
    path = require("path"),
    Git = require("git-wrapper"),
    GitHub = require("github"),
    exec = require('child_process').exec,
    async = require('async'),
    express = require('express'),
    engines = require('consolidate');

var app = express();
var userName = process.argv[2],
    passwd = process.argv[3],
    cloud = "~/.qomoCloud",
    gitdir = cloud + "/.git";
var git = new Git({'git-dir': gitdir});
    github = new GitHub({
            version: "3.0.0"
    });

function init(callback){
    var files;

    async.waterfall([
            function (callback) {
                async.mapSeries(['rm -rf ' + cloud, "mkdir -p " + cloud, "cp -f ./cloudSync/file.list " + cloud], exec, function (err, results){
                    if (err) console.log(err.message);
                    console.log("exec: " + results);
                    callback(null) 
                });
            },
            function (callback) {
                git.exec("init", function (err, msg) {
                    if (err) console.log(err.message);
                    console.log("init: " + msg);
                    callback(null);
                });
            },
            function (callback) {
                fs.readFile(cloud + "/file.list", "utf8", function (err, data){ 
                    if (err) {
                        console.log(err.message);
                        callback(err);
                    }
                    console.log("data: " + data);
                    callback(null, data.trim().split('\n'));
                });
            },
            function (files, callback) {
                files.forEach(function (element, index, array){
                    var dir = cloud + '/' + path.dirname(element);
                    async.series([
                        function (callback) {
                            async.mapSeries(['mkdir -p ' + dir, 'cp -f ' + element + ' ' + dir], exec, function (err, results) {
                               if(err) callback(err);
                               console.log("exec: " + results);
                               callback(null);
                            });
                        },
                        function (callback) {
                            git.exec('add', ['./' + element], function (err, msg) {
                               if(err) callback(err);
                               console.log("add: " + msg);
                               callback(null);
                            });
                        }
                        ], function (err, results) {
                            if (err) console.log(err.message);
                            callback(null);
                        });
                });
            },
            function (callback) {
                git.exec("add", ["file.list"], function (err, msg) {
                    if (err) console.log(err.message);
                    console.log("add: " + msg);
                    callback(null);
                });
            },
            function (callback) {
                git.exec("commit", ['-m "qomoCloud init"'], function (err, msg) {
                    if (err) console.log(err.message);
                    console.log("commit: " + msg);
                    callback(null);
                });
            },
            function (callback) {
                github.authenticate({
                    type: "basic",
                    username: userName,
                    password: passwd
                });
                github.repos.create(
                    {
                      "name": "qomoCloud",
                      "description": "This is qomoCloud repo",
                      "homepage": "https://github.com",
                      "private": false,
                      "has_issues": true,
                      "has_wiki": true,
                      "has_downloads": true
                    }, function (err, res){
                        if (err) console.log(err.message);
                        console.log("repos:" + res);
                        callback(null);
                    });
            },
            function (callback) {
                git.exec("remote", ["add origin git@github.com:" + userName + "/qomoCloud.git"], function (err, msg) {
                    if (err) console.log(err.message);
                    console.log("remote: " + msg);
                    callback(null);
                });
            },
            function (callback) {
                git.exec("push", ["-u origin master"], function (err, msg) {
                    if (err) console.log(err.message);
                    console.log("push: " + msg);
                    callback(null);
                });
            },
            ]);
}

function watch(callback){
    fs.readFile("file.list", "utf8", function (err, data){
        if (err) {
            console.log(err.message);
            return;
        }
        var files = data.split('\n');
        files.forEach(function (element, index, array){
            var dir = path.dirname(element),
                file = path.basename(element);
            console.log(element);
            fs.watch('/' + element, function (event, file){
                console.log('event is: ' + event);
                callback(file);
            });
        });
    });
}

init(function (file) {
    if (file) 
        console.log(file + " is change!");
});

app.engine('haml', engines.haml);
app.engine('html', engines.hogan);

app.use(express.static(__dirname + '/'));

app.get('/', function(req, res){
        res.render('index.html');
});

app.listen(8080);
