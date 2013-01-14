#!/usr/bin/env node
var fs = require("fs"),
    path = require("path"),
    Git = require("git-wrapper"),
    GitHub = require("github"),
    exec = require('child_process').exec,
    async = require('async'),
    express = require('express'),
    engines = require('consolidate');

var date = null;
var watchfiles = [];
var app = express();
var userName, passwd, home, cloud, gitdir, git;
var appsfile = "apps.xml";
var repo = "qomoCloud";
var github = new GitHub({
    version: "3.0.0"
});

function init(loadIndex){

    async.waterfall([
            function (callback) {
                fs.readFile("apps.list", "utf8", function (err, data){
                    var apps = data.trim().split(/\n+/);
                    if(fs.existsSync(appsfile)) fs.unlinkSync(appsfile);
                    if (apps.length === 0 || apps.length === 1 && apps[0] === '') {
                        loadIndex("error");
                    } else {
                        apps.forEach(function (element, index, array){
                            var apps = element.trim().split(/\s+/);
                            fs.appendFileSync(appsfile, '<div class="app unsync ' + apps[1] + '"><img src="img/apps/' + apps[0] + '.png" alt="' + apps[0] + '" ><h6 class="name">' + apps[0] + '</h6></div>',"utf8");
                        });
                        loadIndex("success");
                        callback(err);
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
            }
    ], function (err, result) {
        loadIndex("OK");
    });
}

function filesWatch(files, callback){
    if (watchfiles.length > 0) {
        watchfiles.forEach(function (element, index, array){
            var dir = path.dirname(element);
            var file = path.basename(element);
            if (dir === "_HOME") dir = home;
            console.log("unwatch " + element);
            fs.unwatchFile('/' + dir + '/' + file);
        });
    }
    watchfiles = files;
    files.forEach(function (element, index, array){
        var dir = path.dirname(element);
        var file = path.basename(element);
        if (dir === "_HOME") dir = home;
        console.log("watch " + element);
        fs.watchFile('/' + dir + '/' + file, function (curr, prev){
            console.log('the current modification time is: ' + curr.mtime);
            if (dir === home) dir = '.';
            exec('cd  ' + home + '; cp -fa ' + dir + '/' + file + ' ' + cloud + '/' + dir, function (error, stdout, stderr) {
                if (error) {
                    callback(error);
                } else {
                    var oldpath = process.cwd();
                    process.chdir(cloud);
                    git.exec('add', ['./' + dir + '/' + file], function (err, msg) {
                        console.log("add: " + msg);
                        process.chdir(oldpath);
                        callback(err, curr.mtime);
                    });
                }
            });
        });
    });
    callback(null, new Date());
}

exec("echo $HOME", function (error, stdout, stderr){ 
    home = stdout.trim();
    cloud = home + "/." + repo;
    gitdir = cloud + "/.git";
    git = new Git({'git-dir': gitdir});

    app.engine('haml', engines.haml);
    app.engine('html', engines.hogan);

    app.use(express.static(__dirname + '/'));
    app.use(express.bodyParser());

    app.get('/', function (req, res){
        res.sendfile("start.html");
    });

    app.post('/login', function (req, res){  
        userName = req.body.name;            
        passwd = req.body.password;          

        github.authenticate({                
            type: "basic",                   
            username: userName,              
            password: passwd                 
        });                                  
        git.exec("config", ["--global user.name " + userName], function (err, msg) {});
        github.repos.watch({"user": userName, "repo": repo}, function (err, result){
            if (err) {
                if (err.code === 404) {
                    init(function (msg) {
                        res.end(msg);             
                    });               
                } else {
                    res.end("fail");
                }
            } else {
                fs.exists(cloud, function (exists) {
                    async.series([
                        function (callback) {
                            git.exec("pull", ["origin"], function (err, msg) {
                                console.log("pull: " + msg);
                                exec('cp ' + cloud + '/' + appsfile + ' . ', function (error, stdout, stderr){
                                    if (error) {
                                        res.end("fail");
                                    } else {
                                        res.end("success");
                                    }                             
                                });
                                callback(err);
                            });
                        },
                        function (callback) {
                            async.mapSeries(['cd  ' + cloud + '; tar -cBpf - * --exclude=. --exclude=..| pkexec tar -C / -xf -', 'pkexec rm -f /' + appsfile, 'cd ' + cloud + '; tar  -cBpf - .*  --exclude=.git --exclude=. --exclude=..| tar -C ' + home + ' -xf - '], exec, function (err, results){
                                console.log("exec: " + results);
                                callback(err);
                            });
                        }
                        ], function (err, results){
                            if (err) 
                                console.log(err.message);
                        }
                        );
                });
            }
        });
    });


    app.post('/', function(req, res){
        var sync = [];
        var add = [];
        var remove = [];
        var apps = [];

        if (typeof req.body.sync !== 'undefined') sync = req.body.sync;
        if (typeof req.body.add !== 'undefined') add = req.body.add;
        if (typeof req.body.remove !== 'undefined') remove = req.body.remove;
        if (typeof req.body.apps !== 'undefined') apps = req.body.apps;

        async.parallel([
            function (callback){
                async.waterfall([
                    function (callback){
                        var count = add.length;
                        var files = [];
                        if (count === 0) {
                            callback(null, files);
                        } else {
                            add.forEach(function (element, index, array){
                                fs.readFile("apps/" + element, "utf8", function (err, data){
                                    count--;
                                    if (err) {
                                        console.log(err.message);
                                    }
                                    files = files.concat(data.trim().split(/\n+/));
                                    if (count === 0) {
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
                                         var file = path.basename(element);
                                         if (dir === "_HOME") dir = "./";
                                         async.series([
                                             function (callback) {
                                                 async.mapSeries(['mkdir -p ' + cloud + '/' + dir, 'cd  ' + home + '; cp -fa ' + dir + '/' + file + ' ' + cloud + '/' + dir], exec, function (err, results) {
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
                                                 git.exec('add', ['./' + dir + '/' + file], function (err, msg) {
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
                                             callback(err);
                                         });
                                     });
                                 }
                             }
                ], function (err, results) {
                    callback(err);
                });
            },
                     function (callback) {
                         async.waterfall([
                                 function (callback){
                                     var count = remove.length;
                                     var files = [];
                                     if (count === 0) {
                                         callback(null, files);
                                     } else {
                                         remove.forEach(function (element, index, array){
                                             fs.readFile("apps/" + element, "utf8", function (err, data){
                                                 count--;
                                                 if (err) {
                                                     console.log(err.message);
                                                 }   
                                                 files = files.concat(data.trim().split('\n'));
                                                 if (count === 0) {
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
                                     var file = path.basename(element);
                                     var oldpath = process.cwd();
                                     if (dir === "_HOME") dir = "";
                                     process.chdir(cloud);
                                     git.exec('rm', [' -f ./' + dir + '/' + file], function (err, msg) {
                                         if(err) callback(err);
                                         console.log("rm: " + msg);
                                         process.chdir(oldpath);
                                         callback(null);
                                     });
                                 });
                             }
                         },
                         function (callback) {
                             fs.unlink(appsfile, function (err){
                                 if (err) {
                                     callback(err);
                                 } else {
                                     apps.forEach(function (element, index, array){
                                         fs.appendFileSync(appsfile, '<div class="app ' + element.flag + ' ' + element.category + '"><img src="img/apps/' + element.name + '.png" alt="' + element.name + '" ><h6 class="name">' + element.name + '</h6></div>', "utf8");
                                     });
                                     callback(null);
                                 } 
                             });
                         }
                         ], function (err, results) {
                             callback(err);
                         }); 
                     }
    ], function (err, results){
        if (err) {
            git.exec("reset", ["--hard"], function (err, msg){
                if (err) {
                    console.log(err.message);
                }
                exec('cp -f ' + cloud + '/' + appsfile + ' . ', function (error, stdout, stderr){
                    res.end("refresh");
                });
            });
            console.log("err" + err.message);
            console.log("results: " + results);
        } else {
            var count = sync.length;
            var files = [];
            async.series([
                    function (callback) {
                        exec('cp -f ' + appsfile + ' ' + cloud, function (error, stdout, stderr){
                            callback(error);
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
                    }
                    ], function (err, results) {
                        if (err) {
                            console.log(err.message);
                            res.end("error");
                        } else {
                            res.end("refresh");
                        }
                    });
                    if (count > 0) {
                        sync.forEach(function (element, index, array){
                            fs.readFile("apps/" + element, "utf8", function (err, data){
                                count--;
                                if (err) {
                                    console.log(err.message);
                                }   
                                files = files.concat(data.trim().split('\n'));
                                if (count === 0) {
                                    filesWatch(files, function(err, time){
                                        date = time;
                                    }); 
                                }   
                            }); 
                        }); 
                    } else if (count === 0) {
                        filesWatch(files, function(err, time){
                            date = time;
                        });
                    }
        }
    });
    });

    app.post('/watch', function(req, res){
        var sync = [];
        var count = 0;
        var files = [];
        if (typeof req.body.sync !== 'undefined') sync = req.body.sync;
        count = sync.length;
        console.log("sync: ");
        if (count > 0) {
            sync.forEach(function (element, index, array){
                fs.readFile("apps/" + element, "utf8", function (err, data){
                    count--;
                    if (err) {
                        console.log(err.message);
                    }   
                    files = files.concat(data.trim().split('\n'));
                    if (count === 0) {
                        filesWatch(files, function(err, time){
                            date = time;
                        }); 
                    }   
                }); 
            }); 
        } else if (count === 0) {
            filesWatch(files, function(err, time){
                date = time;
            });
        }
        res.end("success");
    });

    setInterval(function (){
        console.log("date: " + date);
        if (date) {
            async.series([
                function (callback){
                    git.exec("commit", ['-m "qomoCloud Sync @ ' + date + ' "'], function (err, msg) {
                        console.log("commit: " + msg);
                        callback(err);
                    });
                },
                function (callback) {
                    git.exec("push", ["-u origin master"], function (err, msg) {
                        console.log("push: " + msg);
                        callback(err);
                    });
                }
                ], function (callback) {
                    date = null;
                });
        }
    }, 60*1000);

    app.listen(8000);
});
