var test = function() {
  console.log('test');

  var url = 'http://localhost:1337/';
  var data = 'test string 1';

  $.post(url, data, function(res) {
    console.log(res);
  });
};

window.onload = test;