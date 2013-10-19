var fs = require('fs');

describe("Tissue", function(){
  var Tissue = require("../index");
  var Plasma = require("organic").Plasma;
  var tissue;
  var childCell;
  var plasma = new Plasma();
  var config = {}
  it("creates instance", function(){
    tissue = new Tissue(plasma, config);
  });

  it("spawns new cell from path", function(next){
    plasma.emit({type: "Tissue", action: "start", target: __dirname+"/data/cell.js"}, this, function(c){
      expect(c instanceof Error).toBe(false);
      childCell = c.data;
      expect(fs.existsSync(__dirname+"/data/cell.js.out")).toBe(true);
      expect(fs.existsSync(__dirname+"/data/cell.js.err")).toBe(true);
      next();
    });
  });

  it("kills the new cell", function(next){
    setTimeout(function(){
      plasma.emit({type: "Tissue", action: "stop", target: childCell.pid}, this, function(c){
        expect(c instanceof Error).toBe(false);
        fs.unlink(__dirname+"/data/cell.js.out");
        fs.unlink(__dirname+"/data/cell.js.err");
        next();
      });
    }, 2000);
  });

  it("stops cells", function(next){
    plasma.emit({type: "Tissue", action: "stop", target: "cell.js"}, this, function(c){
      expect(c instanceof Error).toBe(false);
      next();
    });
  })

  it("spawns new cell from with cwd and name", function(next){
    plasma.emit({type: "Tissue", action: "start", target: "cell.js", cwd: __dirname+"/data"}, this, function(c){
      expect(c instanceof Error).toBe(false);
      childCell = c.data;
      expect(fs.existsSync(__dirname+"/data/cell.js.out")).toBe(true);
      expect(fs.existsSync(__dirname+"/data/cell.js.err")).toBe(true);
      next();
    });
  });

  it("stops cell by pid", function(next){
    plasma.emit({type: "Tissue", action: "stop", target: childCell.pid}, this, function(c){
      expect(c instanceof Error).toBe(false);
      fs.unlink(__dirname+"/data/cell.js.out");
      fs.unlink(__dirname+"/data/cell.js.err");
      next();
    });
  })

  it("execs a command", function(next){
    plasma.emit({type: "Tissue", action: "start", cmd: "mkdir testdir"}, this, function(c){
      expect(c instanceof Error).toBe(false);
      c.data.on("exit", function(){
        expect(fs.existsSync(process.cwd()+"/testdir")).toBe(true);
        fs.rmdirSync(process.cwd()+"/testdir");
        next();
      })
    });
  })
});
