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

git.exec('add', ["file.list"], function (err, msg) {
    if (err) console.log(err.message);                         
    console.log("init: " + msg);                               
});  
