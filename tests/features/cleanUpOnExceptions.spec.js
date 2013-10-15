var fs = require("fs");
var path = require("path");
var request = require("request");

describe("Cell Handles Exceptions", function(){
  var Plasma = require("organic").Plasma;
  var plasma = new Plasma();
  var Tissue = require("../../membrane/Tissue");
  var tissue = new Tissue(plasma, {});
  var daemonCell;

  var spawnOptions = {
    target: path.normalize(__dirname+"/../data/daemonCell.js"),
    output: false
  }

  it("creates cell instance as daemon", function(next){
    tissue.start(spawnOptions, this, function(c){
      daemonCell = c.data;
      setTimeout(function(){
        var pid = mockGetCellMarker("daemons", spawnOptions.target, daemonCell.pid);
        expect(fs.existsSync(pid)).toBe(true);
        next();
      }, 2000);
    })
  });

  it("triggers error", function(next){
    request.get("http://localhost:1234/throwException", function(err, res, body){

    })
    setTimeout(next, 2000);
  });
  it("should gracefully handle exception and exit by deleting its marker", function(next){
    tissue.list({target: "daemons"}, this, function(c){
      expect(c.data.length).toBe(1);
      expect(c.data[0].pid).toBe(daemonCell.pid.toString());
      next();
    });
  });
  it("should", function(next){
    tissue.stop({target: daemonCell.pid}, this, function(c){
      setTimeout(function(){
        var markerPath = tissue.getCellMarker("daemons", path.basename(spawnOptions.target), daemonCell.pid);
        expect(fs.existsSync(pid)).toBe(false);
        next();
      }, 2000);
    });
  })
});
