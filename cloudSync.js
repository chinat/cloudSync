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
    appsfile = "apps.xml",
    watchfiles = [];
var git = new Git({'git-dir': gitdir});
    github = new GitHub({
        version: "3.0.0"
    });

github.authenticate({
    type: "basic",
    username: userName,
    password: passwd
});

app.engine('haml', engines.haml);
app.engine('html', engines.hogan);

app.use(express.static(__dirname + '/'));
app.use(express.bodyParser());

function init(callback){

    async.waterfall([
            function (callback) {
                fs.readFile("apps.list", "utf8", function (err, data){
                    var apps = data.trim().split(/\n+/);
                    if(fs.existsSync(appsfile)) fs.unlinkSync(appsfile);
                    if (apps.length === 0 || apps.length === 1 && apps[0] === '') {
                        app.get('/', function(req, res){
                            res.sendfile('error.html');
                        });
                    } else {
                        apps.forEach(function (element, index, array){
                            var apps = element.trim().split(/\s+/);
                            fs.appendFileSync(appsfile, '<div class="app unsync ' + apps[1] + '"><img src="img/apps/' + apps[0] + '.png" alt="' + apps[0] + '" ><h6 class="name">' + apps[0] + '</h6></div>',"utf8");
                        });
                        callback(null);
                    }
                });
            },
            function (callback) {
                async.mapSeries(['rm -rf ' + cloud, "mkdir -p " + cloud, "cp " + appsfile + " " + cloud], exec, function (err, results){
                    console.log("exec: " + results);
                    callback(err);
                });
            },
            function (callback) {
                git.exec("init", function (err, msg) {
                    console.log("init: " + msg);
                    callback(err);
                });
            },
            function (callback) {
                var oldpath = process.cwd();
                process.chdir(cloud);
                git.exec('add', ['./' + appsfile], function (err, msg) {
                    console.log("add: " + msg);
                    process.chdir(oldpath);
                    callback(err);
                });
            },
            function (callback) {
                git.exec("commit", ['-m "qomoCloud init"'], function (err, msg) {
                    console.log("commit: " + msg);
                    callback(err);
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
                            console.log("repos:" + res);
                            callback(err);
                        });
            },
            function (callback) {
                git.exec("remote", ["add origin git@github.com:" + userName + "/" + repo + ".git"], function (err, msg) {
                    console.log("remote: " + msg);
                    callback(err);
                });
            },
            function (callback) {
                git.exec("push", ["-u origin master"], function (err, msg) {
                    console.log("push: " + msg);
                    callback(err);
                });
            },
            ], function (err, result) {
                callback(err);
            });
}

function filesWatch(files, callback){
    if (watchfiles.length > 0) {
        watchfiles.forEach(function (element, index, array){
            var dir = path.dirname(element);
            var file = path.basename(element);
            if (dir === "_HOME") dir = home;
            fs.unwatchFile('/' + dir + '/' + file);
        });
    }
    files.forEach(function (element, index, array){
        var dir = path.dirname(element);
        var file = path.basename(element);
        if (dir === "_HOME") dir = home;
        fs.watchFile('/' + dir + '/' + file, function (curr, prev){
            console.log('the current modification time is: ' + curr.mtime);
            callback();
        });
    });
}



github.repos.watch({"user": userName, "repo": repo}, function (err, result){
    if (err) {
        if (err.code === 404) {
            init(function (err) {
                if (err) {
                    app.get('/', function(req, res){
                        res.sendfile('error.html');
                    });
                } else {
                    app.get('/', function(req, res){
                        res.sendfile('start.html');
                    });
                }
            });
        } else {
            app.get('/', function(req, res){
                res.sendfile('error.html');
            });
        }
    } else {
        fs.exists(cloud, function (exists) {
            if (exists) {
                async.series([
                    function (callback) {
                        git.exec("reset", ["--hard"], function (err, msg) {
                            console.log("reset: " + msg);
                            callback(err);
                        });
                    },
                    function (callback) {
                        git.exec("checkout", ["master"], function (err, msg) {
                            console.log("checkout: " + msg);
                            callback(err);
                        });
                    },
                    function (callback) {
                        git.exec("reset", ["--hard"], function (err, msg) {
                            console.log("reset: " + msg);
                            callback(err);
                        });
                    },
                    function (callback) {
                        git.exec("pull", ["origin"], function (err, msg) {
                            console.log("pull: " + msg);
                            callback(err);
                        });
                    },
                    function (callback) {
                        async.mapSeries(['cd  ' + cloud + '; tar -cBpf - * --exclude=. --exclude=..| pkexec tar -C / -xf -', "cp -f /" + appsfile + " .", 'pkexec rm -f /' + appsfile, 'cd ' + cloud + '; tar  -cBpf - .*  --exclude=.git --exclude=. --exclude=..| tar -C ' + home + ' -xf - '], exec, function (err, results){
                            console.log("exec: " + results);
                            callback(err) 
                        });
                    },
                    ], function (err, results){
                        if (err) {
                            app.get('/', function(req, res){
                                res.sendfile('error.html');
                            });
                        } else {
                            app.get('/', function(req, res){
                                res.sendfile('start.html');
                            });
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
                        app.get('/', function(req, res){
                            res.sendfile('error.html');
                        });
                    } else {
                        app.get('/', function(req, res){
                            res.sendfile('start.html');
                        });
                    }
                });
            }
        });
    }
});

app.post('/', function(req, res){
    var sync = [];
    var add = [];
    var remove = [];
    var apps = {};

    if (typeof req.body.sync !== 'undefined') sync = req.body.syn;
    if (typeof req.body.add !== 'undefined') add = req.body.add;
    if (typeof req.body.remove !== 'undefined') remove = req.body.remove;
    if (typeof req.body.apps !== 'undefined') apps = req.body.apps;
    console.log("sync:" + sync);
    console.log("add:" + add);
    console.log("remove:" + remove);
    console.log("apps:" + apps);
    async.parallel([
        function (callback){
            async.waterfall([
                function (callback){
                    var count = add.length;
                    var files = [];
                    if (count == 0) {
                        callback(null, files);
                    } else {
                        add.forEach(function (element, index, array){
                            fs.readFile("apps/" + element, "utf8", function (err, data){
                                count--;
                                if (err) {
                                    console.log(err.message);
                                }
                                files = files.concat(data.trim().split(/\n+/));
                                if (count == 0) {
                                    callback(null, files);
                                }
                            });
                        });
                    }
                },
                         function (files, callback) {
                             if (files.length === 0){
                                 callback(null);
                             } else {
                                 files.forEach(function (element, index, array){
                                     var dir = path.dirname(element);
                                     if (dir === "_HOME") dir = "";
                                     dir = cloud + '/' + dir; 
                                     async.series([
                                         function (callback) {
                                             async.mapSeries(['mkdir -p ' + dir, 'cd  ' + home + '; cp -fa ' + element + ' ' + dir], exec, function (err, results) {
                                                 if(err) {
                                                     callback(err);
                                                 } else {
                                                     console.log("exec: " + results);
                                                     callback(null);
                                                 }
                                             });
                                         },
                                         function (callback) {
                                             var oldpath = process.cwd();
                                             process.chdir(cloud);
                                             git.exec('add', ['./' + element], function (err, msg) {
                                                 if(err) {
                                                     callback(err);
                                                 } else {
                                                     console.log("add: " + msg);
                                                     process.chdir(oldpath);
                                                     callback(null);
                                                 }
                                             });
                                         }
                                     ], function (err, results) {
                                         if (err) {
                                             callback(err);
                                         } else {
                                             callback(null);
                                         }
                                     });
                                 });
                             }
                         },
                         ], function (err, results) {
                             if (err) {
                                 callback(err);
                             } else {
                                 callback(null);
                             }
                         });
        },
                 function (callback) {
                     async.waterfall([
                             function (callback){
                                 var count = remove.length;
                                 var files = [];
                                 if (count == 0) {
                                     callback(null, files);
                                 } else {
                                     remove.forEach(function (element, index, array){
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
                                 var oldpath = process.cwd();
                                 process.chdir(cloud);
                                 git.exec('rm', [' -f ./' + element], function (err, msg) {
                                     if(err) callback(err);
                                     console.log("rm: " + msg);
                                     process.chdir(oldpath);
                                     callback(null);
                                 });
                             });
                         }
                     },
                     ], function (err, results) {
                         if (err) {          
                             callback(err);
                         } else {    
                             callback(null); 
                         }           
                     }); 
                 },
                 ], function (err, results){
                     if (err) {
                         git.exec("reset", ["--hard"], function (err, msg){
                             if (err) {
                                 app.get('/', function(req, res){
                                     res.sendfile('error.html');
                                 });
                             }
                             console.log("reset: " + msg);
                         });
                     } else {
                         //                         filesWatch(sync, function(err){
                         //                         }); 
                         fs.unlink(appsfile, function (err){
                             if (err) {
                                 app.get('/', function(req, res){
                                     res.sendfile('error.html');
                                 });
                                 console.log(err.message);
                             } else {
                                 apps.forEach(function (element, index, array){
                                     fs.appendFileSync(appsfile, '<div class="app ' + element.flag + ' ' + element.category + '"><img src="img/apps/' + element.name + '.png" alt="' + element.name + '" ><h6 class="name">' + element.name + '</h6></div>', "utf8");
                                 });
                             } 
                         });
                         res.send("refresh");
                         res.end();
                     }
                 });
});

app.listen(8000);
