var fs = require("fs");
var path = require("path");
var Plasma = require("organic").Plasma;
var Tissue = require("../../index");

describe("daemonize-cell", function(){

  var plasma = new Plasma();
  var tissue = new Tissue(plasma, {});
  var daemonCell;
  var spawnOptions = {
    target: path.normalize(__dirname+"/../data/daemonCell.js")
  }

  it("creates cell instance as daemon", function(next){
    tissue.start(spawnOptions, function(c){
      daemonCell = c.data;
      setTimeout(function(){
        var markerPath = tissue.getCellMarker("daemons", "daemonCell.js", daemonCell.pid);
        expect(fs.existsSync(markerPath)).toBe(true);
        expect(fs.existsSync(path.normalize(__dirname+"/../data/daemonCell.js.out"))).toBe(true);
        expect(fs.existsSync(path.normalize(__dirname+"/../data/daemonCell.js.err"))).toBe(true);
        next();
      }, 500);
    })
  });
  it("lists the cell", function(next){
    tissue.list({target: "daemons"}, function(c){
      expect(c.data.length).toBe(1);
      expect(c.data[0].pid).toBe(daemonCell.pid.toString());
      next();
    });
  });
  it("restarts the cell", function(next){
    tissue.restart(spawnOptions, function(c){
      daemonCell = c.data
      setTimeout(function(){
        tissue.list({target: "daemons"}, function(c){
          expect(c.data.length).toBe(1);
          expect(c.data[0].pid).not.toBe(daemonCell.pid);
          next();
        })
      }, 500)
    });
  });
  it("kills the cell", function(next){
    tissue.stop(spawnOptions, function(c){
      expect(c.data).toBe(daemonCell.pid)
      setTimeout(function(){
        var markerPath = tissue.getCellMarker("daemons", "daemonCell.js", daemonCell.pid);
        expect(fs.existsSync(markerPath)).toBe(false);
        next();
      }, 500);
    });
  })
  it("lists no cells", function(next){
    tissue.list({target: "daemons"}, function(c){
      expect(c.data.length).toBe(0);
      fs.unlinkSync(path.normalize(__dirname+"/../data/daemonCell.js.out"));
      fs.unlinkSync(path.normalize(__dirname+"/../data/daemonCell.js.err"));
      next();
    });
  });
});
