var http = require('http');
var moment = require('moment');
var PDF = require('pdfkit');

var count = 0;

http.createServer(function (req, res) {
  var ip = req.connection.remoteAddress;
  var time = '[' + moment().format('DD/MM/YY HH:MM:SS') + ']';
  var agent = req.headers["user-agent"];
  console.log((++count).toString(), ip, time, req.method, req.url, agent);

  res.writeHead(200, {'Content-Type': 'application/pdf'});

  var text = 'Hello world 2!';
  var doc = new PDF();
  doc.pipe(res);
  doc.text(text, 100, 100);
  doc.end();

//  res.end('Hello World\n');
}).listen(1337, '127.0.0.1');