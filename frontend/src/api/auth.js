const BASE_URL = 'http://localhost:8000';

export async function login(username, password, role) {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, role })
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Login failed' }));
    const errorMessage = errorData.detail || errorData.message || 'Đăng nhập thất bại';
    throw new Error(errorMessage);
  }
  
  const data = await response.json();
  // Lưu thông tin tutor_type nếu có
  if (data.tutor_type) {
    localStorage.setItem("tutor_type", data.tutor_type);
  }
  return data;
}

export async function logout(username) {
  const response = await fetch(`${BASE_URL}/auth/logout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username })
  });
  if (!response.ok) throw new Error('Logout failed');
  return await response.json();
}