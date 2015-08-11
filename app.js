var nodemailer = require('nodemailer');
var PDF = require('pdfkit');

var text = 'When nine hundred years old you reach, look as good you will not YO2!.';

var doc = new PDF();
doc.text(text, 100, 100);
doc.end(); //we end the document writing.

var transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'email@email.com',
    pass: 'pass'
  }
});

var mailOptions = {
  from: 'Mail Tester <email@email.com>',
  to: 'email@email.com', // list of receivers
  subject: 'Test subject',
  text: 'Hello, here will be mail body.', // plaintext body
  attachments: [
    {
      filename: 'doc.pdf',
      content: doc
    }
  ]
};

transporter.sendMail(mailOptions, function(error, info) {
  if (error) {
    return console.log(error);
  }
  console.log('Message sent: ' + info.response);
});
