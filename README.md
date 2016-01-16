# PDF-Mailer

### Build:
```
gulp
```

### Run server:
```
node ./bin/app.js
```

### API:
```
POST multipart/form-data:

parameters:
token=base64(key:secret_key;email:your@email.com)

data:
file=html_text
```

### curl example:

```
echo "<h1>Test</h1>" | curl -v --form "htmlcode=@-" --form token=`echo "key:secret_key;email:your@email.com" | base64` -H "Expect:" http://127.0.0.1:1337/
```

### TODO:

`https://github.com/Valve/fingerprintjs2`
