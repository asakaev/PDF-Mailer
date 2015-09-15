# PDF-Mailer

application/x-www-form-urlencoded (63 bytes): `echo "<h1>Test</h1><p>Данные из echo на русском</p>" | curl -v --data-binary @- -H "Authorization: secret_key" --request "POST" "http://localhost:1337/"`

form-data (257 bytes): `echo "<h1>Test</h1><p>Данные из echo на русском</p>" | curl -v --form "image=@-" http://localhost:1337/secret_key2`