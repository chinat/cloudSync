#!/usr/bin/env node
var fs = require("fs"),
    path = require("path"),
    Git = require("git-wrapper"),
    github = require("github"),
    exec = require('child_process').exec,
    async = require('async');


var userName = "sunzhigang",
    passwd = "sunabc123",
    cloud = "/home/sun/.qomoCloud",
    gitdir = cloud + "/.git";
var git = new Git({'git-dir': gitdir});

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
