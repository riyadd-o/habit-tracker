import { create } from 'zustand'
import toast from 'react-hot-toast'
import { loginUser, registerUser } from '../services/authService'

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  initialized: false,

  initAuth: () => {
    try {
      // Look for new key first, then fallback to old key for migration
      let storedToken = localStorage.getItem('token') || localStorage.getItem('habit_tracker_token');
      let storedUser = localStorage.getItem('user') || localStorage.getItem('habit_tracker_user');
      
      if (storedToken) {
        // Sync to new keys if we found old ones
        if (!localStorage.getItem('token')) localStorage.setItem('token', storedToken);
        if (!localStorage.getItem('user') && storedUser) localStorage.setItem('user', storedUser);

        set({ 
          token: storedToken,
          user: storedUser ? JSON.parse(storedUser) : null
        })
      }
    } catch (error) {
      console.error('Failed to init auth', error)
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      localStorage.removeItem('habit_tracker_user')
      localStorage.removeItem('habit_tracker_token')
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
      toast.error(error.message || 'Login failed')
      return false
    }
  },

  signup: async (userData) => {
    try {
      await registerUser(userData)
      toast.success('Account created! Please log in.')
      return true
    } catch (error) {
      toast.error(error.message || 'Registration failed')
      return false
    }
  },

  logout: () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    set({ user: null, token: null })
    toast.success('Logged out')
  },
  
  setUser: (userData) => {
    localStorage.setItem('user', JSON.stringify(userData))
    set({ user: userData })
  }
}))

export default useAuthStore
