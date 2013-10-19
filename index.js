var child_process = require("child_process");
var Organel = require("organic").Organel;
var fs = require("fs");
var path = require("path");
var shelljs = require("shelljs");
var glob = require("glob");
var async = require('async');
var _ = require("underscore")

var getUserHome = function () {
  return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}

var checkPid = function(pid, callback) {
  if(process.platform.indexOf("win") === 0 && process.platform != "darwin") {
    throw new Error("Windows not supported yet");
  } else {
    child_process.exec("ps -p "+pid, function(err, stdout, stderr){
      callback(null, stdout.toString().indexOf(pid) !== -1);
    });
  }
}

module.exports = Organel.extend(function Tissue(plasma, config){
  Organel.call(this, plasma, config);

  this.config = config;

  this.on(config.captureType || "Tissue", function(c, callback){
    if(this[c.action])
      this[c.action](c, callback);
    else
      return false
  });

  if(config.bindTo) {
    var self = this;

    process.on("exit", function(){
      if(fs.existsSync(self.getCellMarker()))
        fs.unlinkSync(self.getCellMarker());
    })
    process.on("SIGTERM", function(){
      if(fs.existsSync(self.getCellMarker()))
        fs.unlinkSync(self.getCellMarker());
      process.exit(0);
    })
    process.on("SIGINT", function(){
      if(fs.existsSync(self.getCellMarker()))
        fs.unlinkSync(self.getCellMarker());
      process.exit(0);
    });

    var exceptionWrapper = function(err){
      if(fs.existsSync(self.getCellMarker()))
        fs.unlinkSync(self.getCellMarker());
      console.error(err.stack)
      process.exit(1);
    }
    process.on("uncaughtException", exceptionWrapper);

    if(config.unwrapUncaughtExceptions)
      this.on(config.unwrapUncaughtExceptions, function(){
        process.removeListener("uncaughtException", exceptionWrapper)
        return false;
      });

    this.on("kill", function(){
      if(fs.existsSync(self.getCellMarker()))
        fs.unlinkSync(self.getCellMarker());
      return false;
    })

    if(!fs.existsSync(path.join(getUserHome(),".organic",config.bindTo)))
      shelljs.mkdir('-p', path.join(getUserHome(),".organic",config.bindTo));

    fs.writeFileSync(this.getCellMarker(),
      JSON.stringify({
        source: path.dirname(process.argv[1]),
        cwd: process.cwd()
      }));
  }
},{
  getCellMarker: function(tissue, filename, pid) {
    if(tissue && filename && pid)
      return path.join(getUserHome(),".organic", tissue, filename)+"."+pid;
    return path.join(getUserHome(),".organic", this.config.bindTo, path.basename(process.argv[1]))+"."+process.pid;
  },
  start: function(c, callback){

    var argv = c.argv || [];

    var stdio = [];

    if(c.target && !c.cwd) {
      if(c.target.indexOf("/") !== 0 && c.target.indexOf(":") !== 1)
        c.cwd = process.cwd()
      else
        c.cwd = path.dirname(c.target)
    }
    if(c.target && c.output !== false)  {
      var err = out = path.join(c.cwd, path.basename(c.target));
      out = fs.openSync(out+".out", 'a');
      err = fs.openSync(err+".err", 'a');
      stdio = ['ignore', out, err];
    }

    var options = {
      detached: true,
      cwd: c.cwd,
      env: c.env || process.env,
      silent: true,
      stdio: stdio
    }

    var childCell;
    if(c.target)
      childCell = child_process.spawn(process.argv[0], [c.target].concat(argv), options);
    else
    if(c.cmd)
      childCell = child_process.exec(c.cmd, options);
    else {
      if(callback) callback(new Error("target or exec missing"));
      return;
    }

    childCell.unref();

    c.data = childCell;
    if(callback) callback(c);
  },
  stop: function(c, callback){
    if(isNaN(c.target)) {
      this.list({}, function(r){
        var stopped = [];
        r.data.forEach(function(entry){
          if(entry.name == c.target || entry.tissue == c.target || entry.pid == c.target) {
            process.kill(entry.pid);
            stopped.push(entry);
          }
        });
        if(callback) callback({data: stopped});
      })
    } else {
      process.kill(c.target)
      if(callback) callback(c.target)
    }
  },
  restart: function(c, callback) {
    var self = this

    this.list({}, function(r){
      var restarted = [];
      async.each(r.data, function(entry, next){
        if(entry.name == c.target || entry.tissue == c.target || entry.pid == c.target) {
          fs.readFile(entry.marker, function(err, data){
            if(err) return;
            try{
              data = JSON.parse(data.toString())
            }catch(e){
              return next(e)
            }
            process.kill(entry.pid);
            self.start({target: path.join(data.source,entry.name), cwd: data.cwd}, function(started){
              restarted.push(_.extend({}, entry, {
                pid: started.data.pid
              }));
              next()
            })
          })
        } else
          next()
      }, function(err){
        if(err) return callback(err)
        if(callback) callback({data: restarted});
      });
    })
  },
  list: function(c, callback){
    var root = path.join(getUserHome(),"/.organic");
    var organicDir = path.join(root, c.target || "");
    glob(organicDir+"/**/*.*", function(err, files){
      var entries = [];
      files.forEach(function(file){
        var entry = {
          name: path.basename(file, path.extname(file)),
          tissue: path.dirname(file).replace(root+"/", ""),
          pid: file.split(".").pop(),
          marker: file
        };
        if(entry.pid == process.pid)
          entry.self = true;
        entries.push(entry);
      });
      c.data = entries;
      if(callback) callback(c);
    });
  },
  cleanup: function(c, callback) {
    var self = this;
    this.list(c, function(r){
      var stopped = [];
      async.forEach(r.data, function(entry, next){
        checkPid(entry.pid, function(err, running){
          if(err) return next(err);
          if(!running) {
            fs.unlink(self.getCellMarker(entry.tissue,entry.name, entry.pid), function(err){
              next(err);
            })
            stopped.push(entry);
          } else
            next();
        })
      }, function(err){
        if(err) return callback(err);
        c.data = stopped;
        callback(c);
      })
    })
  }
})
