from fastapi.testclient import TestClient
from app.main import app

with TestClient(app) as client:
    print('HEALTH', client.get('/health').status_code, client.get('/health').json())
    r = client.post('/api/v1/auth/register', json={'email': 'protect7@example.com', 'password': 'StrongPass123', 'full_name': 'Protect User'})
    print('REGISTER', r.status_code, r.json())
    token = client.post('/api/v1/auth/login', json={'email': 'protect7@example.com', 'password': 'StrongPass123'}).json()
    headers = {'Authorization': 'Bearer ' + token['access_token']}
    r = client.post('/api/v1/protection/documents', data={'title': 'Travel Insurance Policy', 'document_type': 'insurance_policy', 'provider_name': 'City Cover', 'description': 'Main travel policy document'}, files={'file': ('policy.pdf', b'%PDF-1.4\n...', 'application/pdf')}, headers=headers)
    print('UPLOAD', r.status_code, r.text)
    if r.status_code != 201:
        raise SystemExit(1)
    doc = r.json()
    r2 = client.post(f"/api/v1/protection/documents/{doc['id']}/analyze", headers=headers)
    print('ANALYZE', r2.status_code, r2.text)
    if r2.status_code != 201:
        raise SystemExit(1)
