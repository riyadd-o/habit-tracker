import { useState, useMemo, useEffect } from 'react'
import useAuthStore from '../hooks/useAuthStore'
import useHabitStore from '../hooks/useHabitStore'
import HabitCard from '../components/HabitCard'
import { Plus, Search, TrendingUp, CheckCircle, Flame, Loader2, List, WifiOff, RefreshCcw, AlertCircle, X, AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const Dashboard = () => {
  const { user } = useAuthStore()
  const { 
    habits, 
    loading, 
    error, 
    fetchHabits, 
    addHabit, 
    deleteHabit, 
    toggleCompletion,
    updateHabit
  } = useHabitStore()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [editingHabitId, setEditingHabitId] = useState(null)
  
  // Delete Sheet State
  const [deleteSheetOpen, setDeleteSheetOpen] = useState(false)
  const [habitToDelete, setHabitToDelete] = useState(null)

  // Create Sheet State
  const [createSheetOpen, setCreateSheetOpen] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', frequency: 'daily' })

  useEffect(() => {
    fetchHabits()
  }, [])

  // Lock body scroll when sheets are open
  useEffect(() => {
    if (deleteSheetOpen || createSheetOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
  }, [deleteSheetOpen, createSheetOpen])

  // --- UI Helpers ---

  const stats = useMemo(() => {
    const totalHabits = habits.length
    const completedToday = habits.filter(h => h.completed).length
    const completionRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0
    
    const totalStreaks = habits.reduce((acc, h) => {
      const streakInfo = useHabitStore.getState().getHabitStreak(h.id)
      return acc + (streakInfo?.current || 0)
    }, 0)

    return { completedToday, totalHabits, completionRate, totalStreaks }
  }, [habits])

  const filteredHabits = habits.filter(h => 
    h.title?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateSubmit = async (e) => {
    e.preventDefault()
    const success = await addHabit(form)
    if (success) {
      setCreateSheetOpen(false)
      setForm({ title: '', description: '', frequency: 'daily' })
    }
  }

  const confirmDelete = (habit) => {
    setHabitToDelete(habit)
    setDeleteSheetOpen(true)
  }

  const handleDeleteHabit = async () => {
    if (habitToDelete) {
      await deleteHabit(habitToDelete.id)
      setDeleteSheetOpen(false)
      setHabitToDelete(null)
    }
  }

  // --- Render Logic ---

  if (loading && habits.length === 0) return (
    <div className="h-full flex flex-col items-center justify-center space-y-4 py-32 animate-fade-in">
      <Loader2 className="w-16 h-16 text-primary-500 animate-spin" />
      <div className="text-center">
        <p className="text-slate-900 dark:text-white font-bold text-xl">Loading your dashboard</p>
      </div>
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-32">
      {/* Header & Stats */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pt-6 relative">
        <div className="space-y-3 flex flex-col justify-center">
          <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Dashboard <span className="text-slate-400 dark:text-slate-600 font-light">Overview</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">
            Welcome back, {user?.name || 'User'}!
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full lg:w-auto">
          {[
            { label: 'Completed', value: stats.completedToday, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
            { label: 'Total Habits', value: stats.totalHabits, icon: List, color: 'text-blue-500', bg: 'bg-blue-500/10' },
            { label: 'Active Streaks', value: stats.totalStreaks, icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10' },
            { label: 'Today Rate', value: `${stats.completionRate}%`, icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-500/10' },
          ].map((stat, i) => (
            <div key={i} className="card p-4 flex flex-col items-center text-center">
              <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
              <div className="text-xl font-bold">{stat.value}</div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-sans">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Main Content Area */}
      <div className="space-y-6">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search habits..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-11 h-12 bg-white dark:bg-slate-900 shadow-sm border-slate-100 dark:border-slate-800"
            />
          </div>
          <button 
            onClick={() => setCreateSheetOpen(true)}
            className="btn btn-primary h-12 px-6 w-full sm:w-auto flex items-center gap-2 text-lg font-bold shadow-lg shadow-primary-500/20"
          >
            <Plus className="w-5 h-5" />
            Create New Habit
          </button>
        </div>

        {/* Habits List */}
        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence mode="popLayout" initial={false}>
            {filteredHabits.sort((a,b) => (a.completed === b.completed ? 0 : a.completed ? 1 : -1)).map(habit => (
              <HabitCard 
                key={habit.id} 
                habit={habit} 
                isEditing={editingHabitId === habit.id}
                toggleCompletion={() => toggleCompletion(habit.id)}
                onDelete={() => confirmDelete(habit)}
                onEdit={(id) => setEditingHabitId(id)}
                onCancelEdit={() => setEditingHabitId(null)}
                onSaveEdit={updateHabit}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* DELETE BOTTOM SHEET */}
      <AnimatePresence>
        {deleteSheetOpen && (
          <div className="fixed inset-0 z-[70] flex items-end justify-center">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteSheetOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-[2.5rem] p-8 shadow-2xl z-10"
            >
              <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-8" />
              
              <div className="text-center space-y-4 mb-8">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mx-auto">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black">Delete Habit</h3>
                <p className="text-slate-500">
                  Are you sure you want to delete <span className="font-bold text-slate-900 dark:text-white">'{habitToDelete?.title}'</span>? <br/> This action cannot be undone.
                </p>
              </div>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleDeleteHabit}
                  className="btn bg-red-500 text-white hover:bg-red-600 h-14 rounded-2xl font-bold text-lg transition-all active:scale-95"
                >
                  Delete Habit
                </button>
                <button 
                  onClick={() => setDeleteSheetOpen(false)}
                  className="btn bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 h-14 rounded-2xl font-bold text-lg transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE BOTTOM SHEET */}
      <AnimatePresence>
        {createSheetOpen && (
          <div className="fixed inset-0 z-[70] flex items-end justify-center">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCreateSheetOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-[2.5rem] p-8 shadow-2xl z-10"
            >
              <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-8" />
              <h3 className="text-2xl font-black mb-6 text-center">New Habit</h3>
              
              <form onSubmit={handleCreateSubmit} className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 block mb-2 px-1">Habit Title</label>
                  <input 
                    required 
                    placeholder="e.g. Read for 30 minutes"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="input h-14 text-lg bg-slate-50 dark:bg-slate-800/50" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 block mb-2 px-1">Frequency</label>
                    <select 
                      value={form.frequency}
                      onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                      className="input h-14 bg-slate-50 dark:bg-slate-800/50"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setCreateSheetOpen(false)}
                    className="btn flex-1 bg-slate-100 dark:bg-slate-800 h-14 rounded-2xl font-bold"
                  >
                    Close
                  </button>
                  <button 
                    type="submit" 
                    className="btn flex-1 btn-primary h-14 rounded-2xl font-bold shadow-xl shadow-primary-500/30"
                  >
                    Create Habit
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Dashboard
