/**
 * Filter script tags
 *
 * @param {JQuery.node} html
 * @result {string}
 */
var filter = function(html) {
  html.find('script').remove();
  return html.html();
};

/**
 * Access point
 */
var run = function() {
  var bodyNode = $('body').clone();
  var bodyHTML = filter(bodyNode);
  console.log(bodyHTML);

  var url = 'http://localhost:1337/';

  $.post(url, bodyHTML, function(response) {
    console.log(response);
  });
};

$(document).ready(run);
