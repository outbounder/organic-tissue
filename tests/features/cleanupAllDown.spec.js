var fs = require("fs");
var path = require("path");
var request = require("request");

describe("cleanupAllDown", function(){
  var Plasma = require("organic").Plasma;
  var plasma = new Plasma();
  var Tissue = require("../../index");
  var tissue = new Tissue(plasma, {});
  var daemonCell;

  var spawnOptions = {
    target: path.normalize(__dirname+"/../data/daemonCell.js"),
    output: false
  }
  var crashPath1 = tissue.getCellMarker("daemons", "daemonCell.js", "1313");
  var crashPath2 = tissue.getCellMarker("daemons", "daemonCell.js", "1312");

  it("creates cell instance as daemon", function(next){
    tissue.start(spawnOptions, function(c){
      daemonCell = c.data;
      setTimeout(next, 2000)
    })
  });

  it("creates crashed instances of daemon", function(next){
    fs.writeFileSync(crashPath1);
    fs.writeFileSync(crashPath2);
    next();
  });
  it("cleans up", function(next){
    tissue.cleanup({target: "daemons"}, function(c){
      expect(c.data.length).toBe(2);
      next();
    });
  })
  it("lists the cell", function(next){
    tissue.list({target: "daemons"}, function(c){
      expect(c.data.length).toBe(1);
      expect(c.data[0].pid).toBe(daemonCell.pid.toString());
      next();
    });
  });
  it("kills the cell", function(next){
    tissue.stop({target: daemonCell.pid}, function(c){
      next()
    });
  })
});
