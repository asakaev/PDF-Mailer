describe('PDF-Mailer API', function() {
  context('POST', function() {
    describe('token', function() {
      it('should be ok if base64 string (key:key;email:asd@asd.com)');
      it('should be not ok if empty string');
      it('should be not ok if key is missing');
      it('should be not ok if email is missing');
    });
  });

  context('GET', function() {
    describe('client JS file', function() {
      it('should return client JS file');
    });
  });
});
