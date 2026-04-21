import { create } from 'zustand'
import { loginUser, registerUser } from '../services/authService'

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  initialized: false,

  initAuth: async () => {
    try {
      let storedToken = localStorage.getItem('token');
      let storedUser = localStorage.getItem('user');
      
      if (storedToken) {
        set({ 
          token: storedToken,
          user: storedUser ? JSON.parse(storedUser) : null
        })

        // Background refresh to sync across devices
        try {
          // Import service dynamically to avoid circular dependencies if any
          const { getUserSettings } = await import('../services/userService');
          const latestUser = await getUserSettings();
          if (latestUser) {
            localStorage.setItem('user', JSON.stringify(latestUser));
            set({ user: latestUser });
          }
        } catch (syncErr) {
          console.error('Background sync failed:', syncErr.message);
        }
      }
    } catch (error) {
      console.error('Failed to init auth', error)
      localStorage.removeItem('user')
      localStorage.removeItem('token')
    } finally {
      set({ initialized: true })
    }
  },

  login: async (email, password) => {
    try {
      const data = await loginUser({ email, password })
      
      const { token, user } = data
      
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      
      set({ user, token })
      return true
    } catch (error) {
      console.error('Login failed', error)
      return false
    }
  },

  signup: async (userData) => {
    try {
      await registerUser(userData)
      return true
    } catch (error) {
      console.error('Registration failed', error)
      return false
    }
  },

  logout: () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    set({ user: null, token: null })
  },
  
  setUser: (userData) => {
    localStorage.setItem('user', JSON.stringify(userData))
    set({ user: userData })
  }
}))

export default useAuthStore
