function doGet(e) {
  var email = e.parameter['email'] || null;
  var name = e.parameter['name'] || 'username';

  var result = {};

  if (email) {
    htmlToPDF(email, name);

    result.status = 'ok';
    result.email = email;
    result.quota = MailApp.getRemainingDailyQuota();
  } else {
    result.status = 'fail';
    result.request = e;
  }

  return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
}


function htmlToPDF(email, name) {
  var html = "<h1>Hello, " + name + " </h1>"
      + "<p>The quick brown fox jumped over the lazy dog";

  var blob = Utilities.newBlob(html, "text/html", "text.html");
  var pdf = blob.getAs("application/pdf");

  MailApp.sendEmail(email, "PDF File", "",
      {htmlBody: html, attachments: pdf});
}
