import urllib.request
import urllib.parse
import json

# Get admin token
url = "http://localhost:8081/realms/master/protocol/openid-connect/token"
data = urllib.parse.urlencode({
    "client_id": "admin-cli",
    "username": "admin",
    "password": "admin",
    "grant_type": "password"
}).encode("utf-8")

req = urllib.request.Request(url, data=data)
try:
    with urllib.request.urlopen(req) as response:
        res = json.loads(response.read().decode())
        token = res["access_token"]
except Exception as e:
    print("Failed to get token:", e)
    exit(1)

# Get client scopes for josanz-web-app-realm
scopes_url = "http://localhost:8081/admin/realms/josanz-web-app-realm/client-scopes"
req = urllib.request.Request(scopes_url)
req.add_header("Authorization", f"Bearer {token}")

try:
    with urllib.request.urlopen(req) as response:
        scopes = json.loads(response.read().decode())
        print("Available Client Scopes in Realm:")
        for scope in scopes:
            print(f"- {scope['name']} ({scope['id']})")
except Exception as e:
    print("Failed to get scopes:", e)
