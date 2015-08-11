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
  var ip = req.connection.remoteAddress;
  var agent = req.headers["user-agent"];
  console.log((++count).toString(), ip, getTime(), req.method, req.url, agent);
  var params = getParams(req.url);

  handleRequest(res, params, ip);
}).listen(config.port, config.host);



/**
 * Generate template
 * @param {!string} name
 * @returns {PDF}
 */
var template = function(name) {
  var doc = new PDF();
  var text = 'When nine hundred years old you reach, look as good you' +
      ' will not, ' + name + '.';

  doc.text(text, 100, 100);
  doc.end(); //we end the document writing.

  return doc;
};



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
  var doc = template(name);

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

    console.log((count).toString(), ip, getTime(), info.response);

    res.writeHead(200, {'Content-Type': 'plain/text'});
    res.end('done!');
  });
};
