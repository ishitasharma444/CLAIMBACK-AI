import os
from fastapi.testclient import TestClient
from app.main import app

test_pdf_path = r"c:\Users\DCK\OneDrive\Desktop\CLAIMBACK-AI-1\claimback-backend\uploads\ClaimBack_Flight_Cancellation_Policy_a4ff701eec6f464aba5c3f24b5b07118.pdf"

with open(test_pdf_path, "rb") as f:
    pdf_bytes = f.read()

with TestClient(app) as client:
    print('1. HEALTH CHECK:', client.get('/health').status_code, client.get('/health').json())
    
    # Register & Login
    client.post('/api/v1/auth/register', json={'email': 'real_test_user@example.com', 'password': 'StrongPass123!', 'full_name': 'Real Test User'})
    token_resp = client.post('/api/v1/auth/login', json={'email': 'real_test_user@example.com', 'password': 'StrongPass123!'}).json()
    headers = {'Authorization': 'Bearer ' + token_resp['access_token']}
    
    # Upload test PDF ClaimBack_Flight_Cancellation_Policy.pdf
    up_resp = client.post(
        '/api/v1/protection/documents',
        data={
            'title': 'Flight Cancellation Policy',
            'document_type': 'travel_document',
            'provider_name': 'Demo Airline',
            'description': 'Flight cancellation demo policy'
        },
        files={'file': ('ClaimBack_Flight_Cancellation_Policy.pdf', pdf_bytes, 'application/pdf')},
        headers=headers
    )
    print('2. UPLOAD STATUS:', up_resp.status_code)
    if up_resp.status_code != 201:
        print('Upload failed:', up_resp.text)
        raise SystemExit(1)
    
    doc = up_resp.json()
    doc_id = doc['id']
    print(f'Uploaded Document ID: {doc_id}, Path: {doc["original_filename"]}')
    
    # Run Analyze
    an_resp = client.post(f"/api/v1/protection/documents/{doc_id}/analyze", headers=headers)
    print('3. ANALYZE STATUS:', an_resp.status_code)
    if an_resp.status_code != 201:
        print('Analyze failed:', an_resp.text)
        raise SystemExit(1)
        
    analysis_data = an_resp.json()['analysis']
    print("\n==========================================")
    print("ANALYSIS RESULTS RETURNED BY BACKEND:")
    print("==========================================")
    print("Protection Score:", analysis_data.get('protection_score'))
    print("Important Deadlines:", [x.encode('ascii', 'ignore').decode() for x in analysis_data.get('important_deadlines', [])])
    print("Coverage Entitlements:", [x.encode('ascii', 'ignore').decode() for x in analysis_data.get('coverage_entitlements', [])])
    print("Exclusions:", [x.encode('ascii', 'ignore').decode() for x in analysis_data.get('exclusions', [])])
    print("Required Documentation:", [x.encode('ascii', 'ignore').decode() for x in analysis_data.get('required_documentation', [])])
    print("Precautions:", [x.encode('ascii', 'ignore').decode() for x in analysis_data.get('precautions', [])])
    print("Findings Count:", len(analysis_data.get('findings_json', {}).get('findings', [])))
    print("First Finding:", analysis_data.get('findings_json', {}).get('findings', [])[0] if analysis_data.get('findings_json', {}).get('findings') else None)
    print("Actions Count:", len(analysis_data.get('findings_json', {}).get('actions', [])))
    
    # Verify GET endpoints work
    list_resp = client.get(f"/api/v1/protection/documents/{doc_id}/analysis", headers=headers)
    print("\n4. GET LIST ANALYSES STATUS:", list_resp.status_code, "Count:", len(list_resp.json()))
    
    get_resp = client.get(f"/api/v1/protection/analysis/{analysis_data['id']}", headers=headers)
    print("5. GET SINGLE ANALYSIS STATUS:", get_resp.status_code, "Score:", get_resp.json()['protection_score'])

