const API_URL = import.meta.env.VITE_API_URL || 'https://habit-tracker-qcn7.onrender.com'

const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    'Authorization': token
  }
}

export const getHabits = async () => {
  try {
    const response = await fetch(`${API_URL}/habits`, {
      headers: getAuthHeaders()
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }
    
    return response.json()
  } catch (error) {
    console.error('getHabits service error:', error.message)
    throw error
  }
}

export const createHabit = async (habitData) => {
  try {
    const response = await fetch(`${API_URL}/habits`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(habitData)
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to create habit')
    }
    
    return response.json()
  } catch (error) {
    console.error('createHabit service error:', error.message)
    throw error
  }
}

export const updateHabit = async (id, habitData) => {
  try {
    const response = await fetch(`${API_URL}/habits/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(habitData)
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to update habit')
    }
    
    return response.json()
  } catch (error) {
    console.error('updateHabit service error:', error.message)
    throw error
  }
}

export const deleteHabit = async (id) => {
  try {
    const response = await fetch(`${API_URL}/habits/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to delete habit')
    }
    
    return response.json()
  } catch (error) {
    console.error('deleteHabit service error:', error.message)
    throw error
  }
}

export const getLogs = async () => {
  try {
    const response = await fetch(`${API_URL}/logs`, {
      headers: getAuthHeaders()
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to fetch logs')
    }
    
    return response.json()
  } catch (error) {
    console.error('getLogs service error:', error.message)
    throw error
  }
}

export const toggleHabit = async (id) => {
  try {
    const response = await fetch(`${API_URL}/habits/${id}/toggle`, {
      method: 'PUT',
      headers: getAuthHeaders()
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to toggle habit')
    }
    
    return response.json()
  } catch (error) {
    console.error('toggleHabit service error:', error.message)
    throw error
  }
}
