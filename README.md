# PDF-Mailer

multipart/form-data:

```echo "<h1>Test</h1>" | curl -v --form "htmlcode=@-" -H "Accept: `echo "token:secret_token;email:your@email.com" | base64`" http://127.0.0.1:1337/```

TODO:

`https://github.com/Valve/fingerprintjs2`
