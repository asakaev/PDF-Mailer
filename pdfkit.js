var PDF = require('pdfkit');
var fs = require('fs');
var text = 'Hello world 2!';

doc = new PDF();                        //creating a new PDF object
doc.pipe(fs.createWriteStream('./hello.pdf'));  //creating a write stream
//to write the content on the file system
doc.text(text, 100, 100);             //adding the text to be written, 
// more things can be added here including new pages
doc.end(); //we end the document writing.
