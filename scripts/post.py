#!/usr/bin/env python3

import requests
import json

payload = {
    "user_id": "d809c4dc-0c6e-43c7-bcac-f389a1e1315e",
    "recipe_id": "b72c5aae-1a84-42e3-a851-9475cca090dc"
}

url = 'http://localhost:8080/api/favourite'

r = requests.post(url, json = payload)
print('Status code:', r.status_code)
print(json.dumps(dict(r.headers), indent=2))
if len(r.text):
    parsed = json.loads(r.text)
    print(json.dumps(parsed, indent=2))
