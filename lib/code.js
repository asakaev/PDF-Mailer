

var transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: config.gmail.user,
    pass: config.gmail.pass
  }
});


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
 * Handle server request
 * @param {!stream} res
 * @param {!string} token
 * @param {!string} email
 * @param {!string} body
 * @param {!string} ip
 */
var handleRequest = function(res, token, email, body, ip) {
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
      console.log('ERROR:', REQ_NUMBER.toString(), ip, getTime(), error);
      result = JSON.stringify({
        status: 'error',
        message: 'Failed to send email'
      });
    } else {
      console.log(REQ_NUMBER.toString(), ip, getTime(), info.response);
      result = JSON.stringify({
        status: 'ok',
        message: 'Email sent'
      });
    }

    res.writeHead(CODE.OK, {'Content-Type': 'application/json'});
    res.end(result);
  });
};



var getMultipartData = function(req, callback) {
  var busboy = new Busboy({ headers: req.headers });

  var fileData = '';
  var token = '';

  busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
    file.on('data', function(data) {
      fileData += data;
    });

    //file.on('end', function() {});
  });

  busboy.on('field', function(fieldname, val) {
    token = val;
  });

  busboy.on('finish', function() {
    var result = {
      file: fileData,
      hash: token
    };

    callback(null, result);
  });

  req.pipe(busboy);
};


var makeResponse = function(res, data) {
  res.writeHead(data.code, {'Content-Type': 'application/json'});
  res.end(JSON.stringify(data.result));
};


var checkParameters = function(hash) {
  var params = parseHash(hash);
  var result;
  var text;

  var email = params.email;
  console.log(params);

  if (params === null) {
    text = 'Invalid parameters';
    result = { status: 'error', message: text};
    console.log(text);

    return {
      code: CODE.BAD_REQUEST,
      result: result
    };
  }

  if (!isValidEmail(email)) {
    text = 'Email is not valid';
    result = { status: 'error', message: text};
    console.log(text);

    return {
      code: CODE.BAD_REQUEST,
      result: result
    };
  }

  return {
    code: CODE.OK,
    result: {
      status: 'ok'
    },
    extra: {
      email: email,
      key: params.key
    }
  };
};
