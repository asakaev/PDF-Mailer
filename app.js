var http = require('http');
var moment = require('moment');
var nodemailer = require('nodemailer');
var config = require('./etc/config.json');
var wkhtmltopdf = require('wkhtmltopdf');

var reqNumber = 0;

var transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: config.gmail.user,
    pass: config.gmail.pass
  }
});


/**
 * @type {{BAD_REQUEST: number, OK: number, METHOD_NOT_ALLOWED: number, REQUEST_TOO_LARGE: number}}
 */
var CODE = {
  BAD_REQUEST: 400,
  OK: 200,
  METHOD_NOT_ALLOWED: 405,
  REQUEST_TOO_LARGE: 413
};


/**
 * Validate email
 * @param {!string} email
 * @return {boolean}
 */
var isValidEmail = function(email) {
  var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
  return re.test(email);
};


/**
 * Parse HTTP POST request body
 * @param {stream} request
 * @param {stream} response
 * @param {function} callback
 * @return {null}
 */
function processPost(request, response, callback) {
  var queryData = '';
  if (typeof callback !== 'function') {
    return null;
  }

  if (request.method === 'POST') {
    request.on('data', function(data) {
      queryData += data;
      if (queryData.length > 1e6) {
        queryData = '';
        response.writeHead(CODE.REQUEST_TOO_LARGE,
            {'Content-Type': 'text/plain'}).end();
        request.connection.destroy();
      }
    });

    request.on('end', function() {
      request.post = queryData;
      callback();
    });

  } else {
    response.writeHead(CODE.METHOD_NOT_ALLOWED,
        {'Content-Type': 'text/plain'});
    response.end();
  }
}


/**
 * Return time in [16/09/15 01:09:85:850] format
 * @return {string}
 */
var getTime = function() {
  return '[' + moment().format('DD/MM/YY HH:MM:SS:SSS') + ']';
};


/**
 * Prepare HTML from body DOM node
 * @param {!string} body
 * @return {string}
 */
var prepareHTML = function(body) {
  var meta = '<meta charset="UTF-8" />';
  return '<html>' + meta + body + '</html>';
};


/**
 * Handle server request
 * @param {!stream} res
 * @param {!string} key
 * @param {!string} body
 * @param {!string} ip
 */
var handleRequest = function(res, key, body, ip) {
  console.log('Key: ' + key);

  var email = config.to;
  var pdf = wkhtmltopdf(prepareHTML(body));

  var mailOptions = {
    from: config.from,
    to: email, // list of receivers
    subject: config.subject,
    text: 'Hello, here will be mail body.', // plaintext body
    attachments: [{filename: 'doc.pdf', content: pdf}]
  };

  transporter.sendMail(mailOptions, function(error, info) {
    var result;

    if (error) {
      console.log('ERROR:', reqNumber.toString(), ip, getTime(), error);
      result = JSON.stringify({
        status: 'error',
        message: 'Failed to send email'
      });
    } else {
      console.log(reqNumber.toString(), ip, getTime(), info.response);
      result = JSON.stringify({
        status: 'ok',
        message: 'Email sent'
      });
    }

    res.writeHead(CODE.OK, {'Content-Type': 'application/json'});
    res.end(result);
  });
};


http.createServer(function(req, res) {
  var ip = req.connection.remoteAddress;
  var agent = req.headers['user-agent'];
  console.log((++reqNumber).toString(), ip, getTime(), req.method, req.url, agent);

  res.setHeader('Access-Control-Allow-Origin', config.origin);
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, PDF-Email');

  if (req.method === 'OPTIONS') {
    res.writeHead(CODE.OK, {'Content-Type': 'text/plain'});
    return res.end();
  }

  var email = req.headers['pdf-email'];
  console.log('email:', email);

  var text;
  var result;

  if (!isValidEmail(email)) {
    text = 'Email is not valid';
    result = JSON.stringify({ status: 'error', message: text});
    console.log(text);
    res.writeHead(CODE.BAD_REQUEST, {'Content-Type': 'application/json'});
    return res.end(result);
  }

  if (req.method !== 'POST') {
    text = 'POST method allowed only';
    result = JSON.stringify({ status: 'error', message: text});
    console.log(text);
    res.writeHead(CODE.OK, {'Content-Type': 'application/json'});
    return res.end(result);
  }

  processPost(req, res, function() {
    var key = req.headers.authorization || 'no_key';
    handleRequest(res, key, req.post, ip);
  });

}).listen(config.port, config.host);
