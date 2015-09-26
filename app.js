var http = require('http');
var moment = require('moment');
var nodemailer = require('nodemailer');
var config = require('./etc/config.json');
var wkhtmltopdf = require('wkhtmltopdf');
var atob = require('atob');

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
 * @param {!string} token
 * @param {!string} email
 * @param {!string} body
 * @param {!string} ip
 */
var handleRequest = function(res, token, email, body, ip) {
  console.log('token: ' + token);

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


/**
 * Parse parameters from hacked Accept header in CORS request
 * @param {!string} header
 * @return {*}
 */
var parseHeader = function(header) {
  if (!header) {
    return null;
  }

  var result = {};
  var split = atob(header).split(';');

  var i, item, keyval;
  for (i = 0; i < split.length; i++) {
    item = split[i];
    keyval = item.split(':');

    var key = keyval[0];
    var val = keyval[1];

    if (!config.app.schema[key] || typeof val === 'String') {
      return null;
    }

    result[key] = val.trim();
  }

  return result;
};


var server = http.createServer(function(req, res) {
  var ip = req.connection.remoteAddress;
  var agent = req.headers['user-agent'];
  console.log((++reqNumber).toString(), ip, getTime(), req.method, req.url, agent);

  var params = parseHeader(req.headers.accept);
  var result;
  var text;

  if (params === null) {
    text = 'Invalid parameters';
    result = JSON.stringify({ status: 'error', message: text});
    console.log(text);
    res.writeHead(CODE.BAD_REQUEST, {'Content-Type': 'application/json'});
    return res.end(result);
  }

  var email = params.email;

  console.log('email:', email);

  res.setHeader('Access-Control-Allow-Origin', config.origin);
  res.setHeader('Access-Control-Allow-Methods', 'POST');

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
    var token = params.token || 'no_key';
    handleRequest(res, token, email, req.post, ip);
  });

});

server.listen(config.port, config.host, function() {
  console.log('Server listening on %s:%s', config.host, config.port);
});
