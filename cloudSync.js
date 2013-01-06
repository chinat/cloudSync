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
    repo = "qomoCloud",
    home = "/home/sun/"
    cloud = home + "/." + repo,
    gitdir = cloud + "/.git",
    appsfile = "apps.list",
    apps = [];
var git = new Git({'git-dir': gitdir});
    github = new GitHub({
        version: "3.0.0"
    });

github.authenticate({
    type: "basic",
    username: userName,
    password: passwd
});

function init(callback){

    fs.readFile(appsfile, "utf8", function (err, data){
        if (err) {
            callback(err);
        } else {
            apps = data.trim().split('\n');
            console.log("apps: " + apps);
            async.waterfall([
                function (callback) {
                    async.mapSeries(['rm -rf ' + cloud, "mkdir -p " + cloud], exec, function (err, results){
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
                    var files = [];
                    var count = apps.length;

                    if (count == 0) {
                        callback(null, files);
                    } else {
                        apps.forEach(function (element, index, array){
                            fs.readFile("apps/" + element, "utf8", function (err, data){
                                count--;
                                if (err) {
                                    console.log(err.message);
                                }
                                files = files.concat(data.trim().split('\n'));
                                if (count == 0) {
                                    callback(null, files);
                                }
                            });
                        });
                    }
                },
                function (files, callback) {
                    if (files == 0){
                        callback(null);
                    } else {
                        files.forEach(function (element, index, array){
                            var dir = cloud + '/' + path.dirname(element);
                            async.series([
                                function (callback) {
                                    async.mapSeries(['mkdir -p ' + dir, 'cd ~; cp -f ' + element + ' ' + dir], exec, function (err, results) {
                                        if(err) callback(err);
                                        console.log("exec: " + results);
                                        callback(null);
                                    });
                                },
                                function (callback) {
                                    var oldpath = process.cwd();
                                    process.chdir(home);
                                    git.exec('add', ['./' + element], function (err, msg) {
                                        if(err) callback(err);
                                        console.log("add: " + msg);
                                        process.chdir(oldpath);
                                        callback(null);
                                    });
                                }
                                ], function (err, results) {
                                    if (err) console.log(err.message);
                                    callback(null);
                                });
                        });
                    }
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
                                "name": repo,
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
                    git.exec("remote", ["add origin git@github.com:" + userName + "/" + repo + ".git"], function (err, msg) {
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
                ], function (err, result) {
                    callback(err);
                });
        }
    });
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

app.engine('haml', engines.haml);
app.engine('html', engines.hogan);

app.use(express.static(__dirname + '/'));
app.use(express.bodyParser());

app.get('/', function(req, res){
    github.repos.watch({"user": userName, "repo": repo}, function (err, result){
        if (err) {
            if (err.code === 404) {
                init(function (err) {
                    if (err) {
                        res.send(err.message);
                    } else {
                        res.sendfile('start.html');
                    }
                });
            } else {
                res.send(err.message);
            }
        } else {
            fs.exists(cloud, function (exists) {
                if (exists) {
                    async.series([
                        function (callback) {
                            git.exec("reset", ["--hard"], function (err, msg) {
                                if (err) console.log(err.message);
                                console.log("reset: " + msg);
                                callback(null);
                            });
                        },
                        function (callback) {
                            git.exec("checkout", ["master"], function (err, msg) {
                                if (err) console.log(err.message);
                                console.log("checkout: " + msg);
                                callback(null);
                            });
                        },
                        function (callback) {
                            git.exec("reset", ["--hard"], function (err, msg) {
                                if (err) console.log(err.message);
                                console.log("reset: " + msg);
                                callback(null);
                            });
                        },
                        function (callback) {
                            git.exec("pull", ["origin"], function (err, msg) {
                                if (err) console.log(err.message);
                                console.log("pull: " + msg);
                                callback(null);
                            });
                        },
                        ], function (err, results){
                            if (err) {
                                res.send(err.message);
                            } else {
                                res.sendfile('start.html');
                            }
                        });
                } else {
                    github.authenticate({
                        type: "basic",
                        username: userName,
                        password: passwd
                    });
                    git.exec("clone", ["git@github.com:" + userName + "/" + repo + ".git  ~/.qomoCloud"], function (err, msg) {
                        if (err) {
                            res.send(err.message);
                        } else {
                            res.sendfile("start.html");
                        }
                    });
               }
            });
        }
    });
});

app.post('/', function(req, res){
    apps = req.body.apps;
    fs.writeFile(appsfile, apps.join("\n"), function (err) {
        if (err) console.log(err.message);
        res.sendfile('start.html');
    });
});

app.listen(8000);
