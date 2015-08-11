var http = require('http');
var moment = require('moment');
var PDF = require('pdfkit');
var nodemailer = require('nodemailer');
var url = require('url');
var queryString = require('querystring');
var config = require('./config.json');

var count = 0;

var transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: config.gmail.user,
    pass: config.gmail.pass
  }
});

http.createServer(function (req, res) {

  // logs
  var ip = req.connection.remoteAddress;
  var time = '[' + moment().format('DD/MM/YY HH:MM:SS') + ']';
  var agent = req.headers["user-agent"];
  console.log((++count).toString(), ip, time, req.method, req.url, agent);

  var qs = url.parse(req.url).query;
  var params = queryString.parse(qs);

  // header
  res.writeHead(200, {'Content-Type': 'plain/text'});

  // PDF create
  var name = params.name || 'username';
  var text = 'When nine hundred years old you reach, look as good you' +
      ' will not, ' + name + '.';

  var doc = new PDF();
  doc.text(text, 100, 100);
  doc.end(); //we end the document writing.

  var email = params.email || config.to;

  var mailOptions = {
    from: config.from,
    to: email, // list of receivers
    subject: config.subject,
    text: 'Hello, here will be mail body.', // plaintext body
    attachments: [
      {
        filename: 'doc.pdf',
        content: doc
      }
    ]
  };

  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      console.log(error);
    }

    time = '[' + moment().format('DD/MM/YY HH:MM:SS') + ']';

    console.log((count).toString(), ip, time, info.response);

    return res.end('done!');
  });

}).listen(1337, '127.0.0.1');
