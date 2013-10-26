var fs = require("fs");
var path = require("path");
var Plasma = require("organic").Plasma;
var Tissue = require("../../index");

describe("daemonize-cell", function(){

  var plasma = new Plasma();
  var tissue = new Tissue(plasma, {});
  var daemonCell;
  var spawnOptions = {
    target: path.normalize(__dirname+"/../data/cell.js"),
    native: true,
    output: false
  }

  it("creates instance as daemon", function(next){
    tissue.start(spawnOptions, function(c){
      daemonCell = c.data;
      setTimeout(function(){
        expect(fs.readFileSync(__dirname+"/../data/cell.js.pid").toString()).toBe(c.data.pid.toString())
        next();
      }, 500);
    })
  });

  it("restarts instance", function(next){
    tissue.restart(spawnOptions, function(c){
      setTimeout(function(){
        expect(fs.readFileSync(__dirname+"/../data/cell.js.pid").toString()).toBe(c.data.pid.toString())
        next()
      }, 500)
    })
  })

  it("stops instance", function(next){
    tissue.stop(spawnOptions, function(c){
      setTimeout(function(){
        expect(fs.existsSync(__dirname+"/../data/cell.js.pid")).toBe(false)
        next()
      }, 500)
    })
  })
  
});
