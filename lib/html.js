

/**
 * Prepare HTML from body DOM node
 * @param {!string} body
 * @return {string}
 */
var prepareHTML = function(body) {
  var meta = '<meta charset="UTF-8" />';
  return '<html>' + meta + body + '</html>';
};
