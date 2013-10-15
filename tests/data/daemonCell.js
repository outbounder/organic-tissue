var http = require("http")
var Tissue = require("../../index")
var tissue = new Tissue(new (require("organic").Plasma), {
  bindTo: "daemons"
})


http.createServer(function(req, res){
  if(req.url.indexOf("throwException"))
    throw new Error("custom exception")
  res.end(JSON.stringify({query: req.query, params: req.params, body: req.body}))
}).listen()
