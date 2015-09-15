var http = require('http');
var moment = require('moment');
var nodemailer = require('nodemailer');
var url = require('url');
var queryString = require('querystring');
var config = require('./config.json');
var wkhtmltopdf = require('wkhtmltopdf');

var count = 0;


var transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: config.gmail.user,
    pass: config.gmail.pass
  }
});


http.createServer(function (req, res) {
  var ip = req.connection.remoteAddress;
  var agent = req.headers["user-agent"];
  console.log((++count).toString(), ip, getTime(), req.method, req.url, agent);
  var params = getParams(req.url);
  console.log((count).toString(), ip, getTime(), JSON.stringify(params));

  handleRequest(res, params, ip);
}).listen(config.port, config.host);


/**
 * Returns time in [11/08/15 18:08:61] format
 * @returns {string}
 */
var getTime = function() {
  return '[' + moment().format('DD/MM/YY HH:MM:SS') + ']';
};


/**
 * Parse querystring
 * @param {!string} url_string
 * @returns {Object}
 */
var getParams = function(url_string) {
  var qs = url.parse(url_string).query;
  return queryString.parse(qs);
};


/**
 * Handle server request
 * @param {!Stream} res
 * @param {!Object} params
 * @param {!String} ip
 */
var handleRequest = function(res, params, ip) {
  var name = params.name || 'username';
  var email = params.email || config.to;

  var html = '<h1>Test</h1><p>Hello world 2</p>';
  var wstream = wkhtmltopdf(html);

  var mailOptions = {
    from: config.from,
    to: email, // list of receivers
    subject: config.subject,
    text: 'Hello, here will be mail body.', // plaintext body
    attachments: [
      {
        filename: 'doc.pdf',
        content: wstream
      }
    ]
  };

  transporter.sendMail(mailOptions, function(error, info) {
    var result;

    if (error) {
      console.log('ERROR:', (count).toString(), ip, getTime(), error);
      result = JSON.stringify({ status: 'fail' });
    } else {
      console.log((count).toString(), ip, getTime(), info.response);
      result = JSON.stringify({ status: 'ok' });
    }

    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(result);
  });
};
