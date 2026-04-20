const API_URL = `${import.meta.env.VITE_API_URL || 'https://habit-tracker-qcn7.onrender.com'}/auth`

export const registerUser = async (userData) => {
  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error || 'Registration failed')
  }
  return data
}

export const loginUser = async (credentials) => {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error || 'Login failed')
  }
  return data
}
