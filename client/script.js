(function () {
  /**
   * @namespace
   */
  var pdfmailer = {};


  /**
   * Filter script tags
   *
   * @param {JQuery.node} html
   * @returns {string}
   */
  pdfmailer.filter = function(html) {
    html.find('script').remove();
    html.find(':button').remove();
    return html.html();
  };


  /**
   *
   * @param {!string} email
   * @returns {boolean}
   */
  pdfmailer.isValidEmail = function(email) {
    return email.trim() !== '';
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
      return console.log('Invalid email');
    }

    var url = 'http://localhost:1337/';

    function responseHandler(data) {
      console.log(data);
    }

    $.ajax({
      url: url,
      type: 'POST',
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Authorization', 'key_42');
      },
      data: bodyHTML,
      contentType: 'application/x-www-form-urlencoded',
      success: responseHandler,
      error: responseHandler
    });
  };

  /**
   * Button handler
   */
  $('.pdf_button').click(pdfmailer.run);
}());
