var fs = require("fs");
var path = require("path");
var request = require("request");

describe("cleanupOnExceptions", function(){
  var Plasma = require("organic").Plasma;
  var plasma = new Plasma();
  var Tissue = require("../../index");
  var tissue = new Tissue(plasma, {});
  var daemonCell;

  var spawnOptions = {
    target: path.normalize(__dirname+"/../data/daemonCell.js")
  }

  it("creates cell instance as daemon", function(next){
    tissue.start(spawnOptions, function(c){
      setTimeout(next, 1000)
    })
  });

  it("triggers error", function(next){
    request.get("http://localhost:1337/throwException", function(err, res, body){
      next()
    })
  });

  it("should gracefully handle exception and exit by deleting its marker", function(next){
    tissue.list({target: "daemons"}, function(c){
      expect(c.data.length).toBe(0);
      next();
    });
  });
});
