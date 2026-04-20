const API_URL = `${import.meta.env.VITE_API_URL || 'https://habit-tracker-qcn7.onrender.com'}/user`;

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': localStorage.getItem('token')
});

export const getUserSettings = async () => {
  const res = await fetch(`${API_URL}/settings`, {
    headers: getHeaders()
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to fetch settings');
  }
  return res.json();
};

export const updateProfile = async (data) => {
  const res = await fetch(`${API_URL}/profile`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to update profile');
  }
  return res.json();
};

export const updateNotifications = async (data) => {
  const res = await fetch(`${API_URL}/notifications`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to update notifications');
  }
  return res.json();
};

export const changePassword = async (data) => {
  const res = await fetch(`${API_URL}/change-password`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to change password');
  }
  return res.json();
};
