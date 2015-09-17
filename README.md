# PDF-Mailer

application/x-www-form-urlencoded (63 bytes):

```echo "<h1>Test</h1>" | curl -v --data-binary @- -H "Accept: `echo "token:secret_token;email:your@email.com" | base64`" --request "POST" "http://localhost:1337/"```

form-data (257 bytes): *

`echo "<h1>Test</h1>" | curl -v --form "htmlcode=@-" http://localhost:1337/secret_key`

TODO:

`https://github.com/Valve/fingerprintjs2`