(function() {
  /**
   * PDF-Mailer namespace
   * @namespace
   */
  var pdfmailer = {};


  /**
   * Unique user ID
   * @type {string}
   */
  pdfmailer.UNIQUE_ID = '1c711fe53cd08eea5055337c8f9278b7';


  /**
   * View namespace
   * @namespace
   */
  var view = {};


  /**
   * Base DIV
   * @type {string}
   */
  view.PDFDIV = 'pdf_div';


  /**
   * Fade-out message
   * @type {string}
   */
  view.PDFMESSAGE = 'pdf_message';


  /**
   * Add elements to DOM and subscribe to events
   */
  view.create = function() {
    var block = '<div class="' + view.PDFDIV + '">' +
        '<input class="pdf_email" type="text"/>' +
        '<input type="button" class="pdf_button" value="Click Me!">' +
        '</div>';

    $('.bottom_div').append(block);
    $('.pdf_button').click(pdfmailer.run);
  };


  /**
   * Show invalid email message
   */
  view.showInvalidEmail = function(message) {
    var html = '<p class="' + view.PDFMESSAGE + '">' + message + '</p>';
    var appNode = '.' + view.PDFDIV;
    var messageNode = appNode + ' .' + view.PDFMESSAGE;

    $(appNode).append(html);

    $(messageNode).fadeOut(3000, function() {
      $(this).remove();
    });
  };


  /**
   * Remove PDF UI from DOM
   */
  view.destroy = function(message) {
    var html = '<p>' + message + '</p>';
    $('.' + view.PDFDIV).html(html);
  };


  /**
   * Filter script tags
   *
   * @param {!object} html
   * @return {string}
   */
  pdfmailer.filter = function(html) {
    html.find('script').remove();
    html.find(':button').remove();
    html.find(':input').remove();
    html.html();
    return;
  };


  /**
   * Validate email
   * @param {!string} email
   * @return {boolean}
   */
  pdfmailer.isValidEmail = function(email) {
    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    return re.test(email);
  };


  /**
   * Access point
   */
  pdfmailer.run = function() {
    var bodyNode = $('body').clone();
    var bodyHTML = pdfmailer.filter(bodyNode);
    console.log(bodyHTML);

    var email = $('.pdf_email').val();
    console.log('email:', email);

    if (!pdfmailer.isValidEmail(email)) {
      var message = 'Invalid email';
      view.showInvalidEmail(message);
      console.log(message);
      return;
    }


    /**
     * Handle XHR response
     * @param {Object} data
     * @param {string} status
     */
    function responseHandler(data, status) {
      if (status === 'success') {
        console.log(data);
        view.destroy(data.message);
      } else {
        console.log('Request failed.');
      }
    }

    /**
     * PDF-Mailer server URL
     * @type {string}
     */
    var url = 'http://localhost:1337/';

    $.ajax({
      url: url,
      type: 'POST',
      beforeSend: function(xhr) {
        xhr.setRequestHeader('Authorization', pdfmailer.UNIQUE_ID);
        xhr.setRequestHeader('PDF-Email', email);
      },
      data: bodyHTML,
      contentType: 'application/x-www-form-urlencoded',
      success: responseHandler,
      error: responseHandler
    });
  };


  /**
   * On document ready
   */
  $('document').ready(view.create);
}());
