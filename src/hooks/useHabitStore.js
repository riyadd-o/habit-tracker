import { create } from 'zustand'
import toast from 'react-hot-toast'
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
      toast.error('Could not load data')
    }
  },

  addHabit: async (data) => {
    try {
      const newHabit = await habitService.createHabit(data)
      set(state => ({ habits: [newHabit, ...state.habits] }))
      toast.success('Habit created!')
      return true
    } catch (e) {
      console.error('Failed to add habit', e)
      toast.error('Could not save habit')
      return false
    }
  },

  updateHabit: async (id, data) => {
    try {
      const updatedHabit = await habitService.updateHabit(id, data)
      set(state => ({
        habits: state.habits.map(h => h.id === id ? { ...h, ...updatedHabit } : h)
      }))
      toast.success('Habit updated!')
      return true
    } catch (e) {
      console.error('Failed to update habit', e)
      toast.error('Could not update habit')
      return false
    }
  },

  deleteHabit: async (id) => {
    if (!window.confirm('Are you sure you want to delete this habit?')) return
    try {
      await habitService.deleteHabit(id)
      set(state => ({
        habits: state.habits.filter(h => h.id !== id),
        logs: state.logs.filter(l => l.habit_id !== id)
      }))
      toast.success('Habit deleted')
    } catch (e) {
      console.error('Failed to delete habit', e)
      toast.error('Could not delete habit')
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
      
      if (updatedHabit.completed) {
        toast.success(updatedHabit.streak > 1 ? `Streak continued: ${updatedHabit.streak} days! 🔥` : 'Habit completed!')
      }
    } catch (e) {
      console.error('Failed to toggle habit', e)
      set({ togglingHabitId: null })
      toast.error('Failed to update status')
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
