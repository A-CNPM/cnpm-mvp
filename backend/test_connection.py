"""
Script kiểm tra kết nối và performance của backend
"""
import requests
import time

BASE_URL = "http://localhost:8000"

def test_endpoint(endpoint, method="GET", data=None):
    """Test một endpoint"""
    try:
        url = f"{BASE_URL}{endpoint}"
        start_time = time.time()
        
        if method == "GET":
            response = requests.get(url, timeout=5)
        else:
            response = requests.post(url, json=data, timeout=5)
        
        elapsed = time.time() - start_time
        
        if response.status_code == 200:
            print(f"✅ {endpoint}: {elapsed:.2f}s - OK")
            return True
        else:
            print(f"❌ {endpoint}: {elapsed:.2f}s - Status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print(f"❌ {endpoint}: Không thể kết nối đến server")
        return False
    except Exception as e:
        print(f"❌ {endpoint}: Lỗi - {str(e)}")
        return False

if __name__ == "__main__":
    print("🔍 Đang kiểm tra backend server...\n")
    
    # Test các endpoint chính
    endpoints = [
        ("/auth/login", "POST", {"username": "test", "password": "test", "role": "Mentee"}),
        ("/forum/posts", "GET"),
        ("/session/user/test", "GET"),
    ]
    
    results = []
    for endpoint_info in endpoints:
        if len(endpoint_info) == 3:
            endpoint, method, data = endpoint_info
            results.append(test_endpoint(endpoint, method, data))
        else:
            endpoint = endpoint_info[0]
            results.append(test_endpoint(endpoint))
        time.sleep(0.5)
    
    print(f"\n📊 Kết quả: {sum(results)}/{len(results)} endpoint hoạt động")

