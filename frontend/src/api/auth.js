const BASE_URL = 'http://localhost:8000';

export async function login(full_name, password, role) {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ full_name, password, role })
  });
  if (!response.ok) throw new Error('Login failed');
  return await response.json();
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