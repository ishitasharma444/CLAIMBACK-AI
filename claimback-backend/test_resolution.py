import urllib.request
import json

base_url = "http://127.0.0.1:8003"
# 1. Login
req = urllib.request.Request(
    f"{base_url}/api/v1/auth/login",
    data=json.dumps({"email": "protect7@example.com", "password": "StrongPass123"}).encode("utf-8"),
    headers={"Content-Type": "application/json"}
)
token = json.loads(urllib.request.urlopen(req).read().decode())["access_token"]
headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

# 2. Create claim
req_c = urllib.request.Request(
    f"{base_url}/api/v1/claims",
    data=json.dumps({"title": "Test Resolution Claim", "category": "flight_delay", "description": "This is a valid claim description"}).encode("utf-8"),
    headers=headers
)
claim = json.loads(urllib.request.urlopen(req_c).read().decode())
claim_id = claim["id"]
print("Claim created:", claim_id)

# 3. GET Resolution
req_res = urllib.request.Request(f"{base_url}/api/v1/claims/{claim_id}/resolution", headers=headers)
try:
    resp = urllib.request.urlopen(req_res)
    print("Resolution HTTP Status:", resp.status)
    print("Resolution Body:", resp.read().decode())
except Exception as e:
    print("Resolution Error:", e)
