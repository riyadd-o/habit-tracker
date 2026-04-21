import { create } from 'zustand'
import * as habitService from '../services/habitService'

const useHabitStore = create((set, get) => ({
  habits: [],
  logs: [],
  loading: false,
  togglingHabitId: null, // For per-habit loading state
  error: null,
  initialized: false,

  fetchHabits: async () => {
    set({ loading: true, error: null })
    try {
      const [habitsData, logsData] = await Promise.all([
        habitService.getHabits(),
        habitService.getLogs()
      ])
      set({ 
        habits: Array.isArray(habitsData) ? habitsData : [], 
        logs: Array.isArray(logsData) ? logsData : [],
        loading: false,
        initialized: true
      })
    } catch (e) {
      console.error('Failed to fetch habits/logs', e)
      set({ error: e.message, loading: false, habits: [], initialized: true })
    }
  },

  addHabit: async (data) => {
    try {
      const newHabit = await habitService.createHabit(data)
      set(state => ({ habits: [newHabit, ...state.habits] }))
      return true
    } catch (e) {
      console.error('Failed to add habit', e)
      return false
    }
  },

  updateHabit: async (id, data) => {
    try {
      const updatedHabit = await habitService.updateHabit(id, data)
      set(state => ({
        habits: state.habits.map(h => h.id === id ? { ...h, ...updatedHabit } : h)
      }))
      return true
    } catch (e) {
      console.error('Failed to update habit', e)
      return false
    }
  },

  deleteHabit: async (id) => {
    try {
      await habitService.deleteHabit(id)
      set(state => ({
        habits: state.habits.filter(h => h.id !== id),
        logs: state.logs.filter(l => l.habit_id !== id)
      }))
    } catch (e) {
      console.error('Failed to delete habit', e)
    }
  },

  toggleCompletion: async (habitId) => {
    set({ togglingHabitId: habitId })
    try {
      const updatedHabit = await habitService.toggleHabit(habitId)
      
      set(state => ({
        habits: state.habits.map(h => h.id === habitId ? { ...h, ...updatedHabit } : h),
        togglingHabitId: null
      }))
    } catch (e) {
      console.error('Failed to toggle habit', e)
      set({ togglingHabitId: null })
    }
  },

  getHabitStreak: (habitId) => {
    const habit = get().habits.find(h => h.id === habitId)
    if (!habit) return { current: 0, longest: 0 }
    return { 
      current: habit.streak || 0,
      longest: habit.longest_streak || 0
    }
  }
}))


export default useHabitStore
