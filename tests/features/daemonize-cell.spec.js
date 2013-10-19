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
        var markerPath = tissue.getCellMarker("daemons", path.basename(spawnOptions.target), daemonCell.pid);
        expect(fs.existsSync(markerPath)).toBe(true);
        expect(fs.existsSync(spawnOptions.target+".out")).toBe(true);
        expect(fs.existsSync(spawnOptions.target+".err")).toBe(true);
        next();
      }, 2000);
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
    tissue.restart({target: daemonCell.pid}, function(c){
      setTimeout(function(){
        tissue.list({target: "daemons"}, function(c){
          expect(c.data.length).toBe(1);
          expect(c.data[0].pid).not.toBe(daemonCell.pid);
          daemonCell = c.data[0]
          next();
        })
      }, 2000)
    });
  });
  it("kills the cell", function(next){
    tissue.stop({target: "daemonCell.js"}, function(c){
      expect(c.data.length).toBe(1)
      expect(c.data[0].pid).toBe(daemonCell.pid)
      setTimeout(function(){
        var markerPath = tissue.getCellMarker("daemons", path.basename(spawnOptions.target), daemonCell.pid);
        expect(fs.existsSync(markerPath)).toBe(false);
        next();
      }, 2000);
    });
  })
  it("lists no cells", function(next){
    tissue.list({target: "daemons"}, function(c){
      expect(c.data.length).toBe(0);
      fs.unlink(spawnOptions.target+".out");
      fs.unlink(spawnOptions.target+".err");
      next();
    });
  });
});
