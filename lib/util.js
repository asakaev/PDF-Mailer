

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
 * Return time in [16/09/15 01:09:85:850] format
 * @return {string}
 */
var getTime = function() {
  return '[' + moment().format('DD/MM/YY HH:MM:SS:SSS') + ']';
};


/**
 * Parse hash from base64 encoded field in CORS request
 * @param {!string} hash
 * @return {*}
 */
var parseHash = function(hash) {
  if (!hash) {
    return null;
  }

  var result = {};
  var split = atob(hash).split(';');

  for (var i = 0; i < split.length; i++) {
    var item = split[i];
    var keyval = item.split(':');

    var key = keyval[0];
    var val = keyval[1];

    if (!config.app.schema[key] || typeof val !== 'string') {
      return null;
    }

    result[key] = val.trim();
  }

  return result;
};
