var http = require('http');
var moment = require('moment');
var nodemailer = require('nodemailer');
var url = require('url');
var querystring = require('querystring');
var config = require('./etc/config.json');
var wkhtmltopdf = require('wkhtmltopdf');

var count = 0;


var transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: config.gmail.user,
    pass: config.gmail.pass
  }
});


function processPost(request, response, callback) {
  var queryData = "";
  if(typeof callback !== 'function') return null;

  if(request.method == 'POST') {
    request.on('data', function(data) {
      queryData += data;
      if(queryData.length > 1e6) {
        queryData = "";
        response.writeHead(413, {'Content-Type': 'text/plain'}).end();
        request.connection.destroy();
      }
    });

    request.on('end', function() {
      request.post = queryData;
      callback();
    });

  } else {
    response.writeHead(405, {'Content-Type': 'text/plain'});
    response.end();
  }
}




http.createServer(function (req, res) {
  var ip = req.connection.remoteAddress;
  var agent = req.headers["user-agent"];
  console.log((++count).toString(), ip, getTime(), req.method, req.url, agent);
  var params = getParams(req.url);
  console.log((count).toString(), ip, getTime(), JSON.stringify(params));

  if (req.method != 'POST') {
    res.writeHead(200, "OK", {'Content-Type': 'text/plain'});
    res.end('not post');
  } else {
    processPost(req, res, function () {
      console.log(req.post);
      // Use request.post here

      var key = req.headers['authorization'] || 'no_key';
      handleRequest(res, key, req.post, ip);

      //res.writeHead(200, "OK", {'Content-Type': 'text/plain'});
      //res.end();
    });
  }



  // test
  //res.writeHead(200, {'Content-Type': 'application/json'});
  //return res.end('done');


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
  return querystring.parse(qs);
};


/**
 * Handle server request
 * @param {!Stream} res
 * @param {!Object} params
 * @param {!String} ip
 */
var handleRequest = function(res, key, body, ip) {
  var email = config.to;

  var rus = 'Русский текст';
  var h1 = '<meta charset="UTF-8" />';
  var html = h1 + '<h1>Test</h1><p>Key: ' + key + ', Body: ' + body + ', RUS: ' + rus +'</p>';
  var pdf = wkhtmltopdf(html);

  var mailOptions = {
    from: config.from,
    to: email, // list of receivers
    subject: config.subject,
    text: 'Hello, here will be mail body.', // plaintext body
    attachments: [
      {
        filename: 'doc.pdf',
        content: pdf
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
