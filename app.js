var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'email@email.com',
    pass: 'pass'
  }
});


var mailOptions = {
  from: 'Fred Foo ✔ <foo@blurdybloop.com>',
  to: 'email@email.com', // list of receivers
  subject: 'Hello ✔',
  text: 'Hello world ✔', // plaintext body
  html: '<b>Hello world ✔</b> ' // html body
};

transporter.sendMail(mailOptions, function(error, info) {
  if (error) {
    return console.log(error);
  }
  console.log('Message sent: ' + info.response);
});
