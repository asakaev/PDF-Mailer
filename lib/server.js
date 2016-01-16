

var server = http.createServer(function(req, res) {
  var ip = req.connection.remoteAddress;
  var agent = req.headers['user-agent'];

  console.log((++REQ_NUMBER).toString(), ip, getTime(),
      req.method, req.url, agent);

  res.setHeader('Access-Control-Allow-Origin', config.origin);
  res.setHeader('Access-Control-Allow-Methods', 'POST');

  if (req.method !== 'POST') {
    var text = 'POST method allowed only';
    var result = JSON.stringify({ status: 'error', message: text});
    res.writeHead(CODE.OK, {'Content-Type': 'application/json'});
    return res.end(result);
  }

  getMultipartData(req, function(err, result) {
    var checkResult = checkParameters(result.hash);

    if (checkResult.status === 'error') {
      makeResponse(res, checkResult);
      return;
    }

    handleRequest(res, checkResult.extra.key, checkResult.extra.email,
        result.file, ip);
  });

});


server.listen(config.port, config.host, function() {
  console.log('Server listening on %s:%s', config.host, config.port);
});
