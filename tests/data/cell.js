var http = require("http")

http.createServer(function(req, res){
  res.end(JSON.stringify({query: req.query, params: req.params, body: req.body}))
}).listen()
