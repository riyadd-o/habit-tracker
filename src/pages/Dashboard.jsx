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
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingHabit, setEditingHabit] = useState(null)
  
  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [habitToDelete, setHabitToDelete] = useState(null)

  // Form state
  const [form, setForm] = useState({ title: '', description: '', frequency: 'daily' })

  useEffect(() => {
    fetchHabits()
  }, [])

  // --- UI Helpers ---

  const stats = useMemo(() => {
    const totalHabits = habits.length
    const completedToday = habits.filter(h => h.completed).length
    const completionRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0
    
    // Calculate total streaks
    const totalStreaks = habits.reduce((acc, h) => {
      const streakInfo = useHabitStore.getState().getHabitStreak(h.id)
      return acc + (streakInfo?.current || 0)
    }, 0)

    return { 
      completedToday, 
      totalHabits, 
      completionRate, 
      totalStreaks
    }
  }, [habits])

  const filteredHabits = habits.filter(h => 
    h.title?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleOpenModal = (habit = null) => {
    if (habit) {
      setEditingHabit(habit)
      setForm({ title: habit.title, description: habit.description || '', frequency: habit.frequency || 'daily' })
    } else {
      setEditingHabit(null)
      setForm({ title: '', description: '', frequency: 'daily' })
    }
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    let success = false
    const habitData = { 
      title: form.title, 
      description: form.description, 
      frequency: form.frequency 
    }

    if (editingHabit) {
      success = await updateHabit(editingHabit.id, habitData)
    } else {
      success = await addHabit(habitData)
    }
    
    if (success) {
      setIsModalOpen(false)
    }
  }

  const confirmDelete = (habit) => {
    setHabitToDelete(habit)
    setDeleteModalOpen(true)
  }

  const handleDeleteHabit = async () => {
    if (habitToDelete) {
      await deleteHabit(habitToDelete.id)
      setDeleteModalOpen(false)
      setHabitToDelete(null)
    }
  }

  // --- Render Logic ---

  if (loading && habits.length === 0) return (
    <div className="h-full flex flex-col items-center justify-center space-y-4 py-32 animate-fade-in">
      <div className="relative">
        <Loader2 className="w-16 h-16 text-primary-500 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 bg-primary-500/10 rounded-full animate-pulse" />
        </div>
      </div>
      <div className="text-center space-y-1">
        <p className="text-slate-900 dark:text-white font-bold text-xl">Loading your dashboard</p>
        <p className="text-slate-500 font-medium italic">Preparing your success story...</p>
      </div>
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 relative">
      {/* Header & Stats */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pt-6 relative">
        <div className="space-y-3 flex flex-col justify-center">
          <div className="flex items-center gap-3">
            <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Dashboard <span className="text-slate-400 dark:text-slate-600 font-light">Overview</span>
            </h2>
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${error ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
              <span className={`w-2 h-2 rounded-full ${error ? 'bg-red-500 animate-pulse' : 'bg-green-500 fill-current'}`} />
              {error ? 'Server Offline' : 'Connected'}
            </div>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">
            Welcome back, {user?.name || 'User'}! Track your progress today.
          </p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full lg:w-auto">
          {[
            { label: 'Completed', value: stats.completedToday, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
            { label: 'Total Habits', value: stats.totalHabits, icon: List, color: 'text-blue-500', bg: 'bg-blue-500/10' },
            { label: 'Active Streaks', value: stats.totalStreaks, icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10' },
            { label: 'Today Rate', value: `${stats.completionRate}%`, icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-500/10' },
          ].map((stat, i) => {
            const Icon = stat.icon
            return (
              <div key={i} className="card p-4 flex flex-col items-center text-center group transition-all hover:shadow-lg hover:-translate-y-1">
                <div className={`${stat.bg} ${stat.color} p-2.5 rounded-xl mb-2 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-xl font-bold">{stat.value}</div>
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-sans">{stat.label}</div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Main Content Area */}
      <div className="space-y-6">
        {/* Error Notice */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl"
          >
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm font-medium">Connectivity issues. Changes might not save until reconnected.</p>
            </div>
            <button 
              onClick={() => fetchHabits()}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition-colors"
            >
              <RefreshCcw className="w-3 h-3" />
              Reconnect Now
            </button>
          </motion.div>
        )}

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search habits..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-11 h-12 bg-white dark:bg-slate-900 shadow-sm border-slate-100 dark:border-slate-800 focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="btn btn-primary h-12 px-6 w-full sm:w-auto flex items-center gap-2 text-lg font-bold shadow-lg shadow-primary-500/20"
          >
            <Plus className="w-5 h-5" />
            Create New Habit
          </button>
        </div>

        {/* Habits List / Error / Empty States */}
        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence mode="popLayout" initial={false}>
            {error && habits.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card p-16 flex flex-col items-center justify-center text-center border-2 border-dashed border-red-200 dark:border-red-900/30 bg-red-50/30 dark:bg-transparent"
              >
                <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
                  <WifiOff className="w-10 h-10 text-red-500" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Connection Lost</h3>
                <p className="text-slate-500 max-w-sm mb-8">
                  We can't reach the server right now. Make sure your internet is working and the backend is online.
                </p>
                <div className="flex flex-col items-center gap-4">
                  <button 
                    onClick={() => fetchHabits()}
                    className="btn btn-primary px-8 h-12 flex items-center gap-2 shadow-xl shadow-primary-500/30"
                  >
                    <RefreshCcw className="w-5 h-5" />
                    Retry Connection
                  </button>
                </div>
              </motion.div>
            ) : filteredHabits.length > 0 ? (
              filteredHabits.sort((a,b) => (a.completed === b.completed ? 0 : a.completed ? 1 : -1)).map(habit => (
                <HabitCard 
                  key={habit.id} 
                  habit={habit} 
                  toggleCompletion={() => toggleCompletion(habit.id)}
                  onDelete={() => confirmDelete(habit)}
                  onEdit={() => handleOpenModal(habit)}
                />
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="card p-20 flex flex-col items-center justify-center text-center"
              >
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                  <Plus className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold mb-2">No habits found</h3>
                <p className="text-slate-500 max-w-sm mb-8">
                  {searchTerm ? "No habits match your search." : "You haven't created any habits yet. Start your journey today!"}
                </p>
                {!searchTerm && (
                  <button 
                    onClick={() => handleOpenModal()}
                    className="btn btn-primary"
                  >
                    Create Your First Habit
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Habit Creation/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="card w-full max-w-md relative z-10 p-6 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-primary-500" />
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl font-bold">{editingHabit ? 'Edit Habit' : 'Create New Habit'}</h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label text-xs">Title</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="e.g. Morning Meditation"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="input h-10 text-base focus:ring-2 focus:ring-primary-500/20" 
                  />
                </div>

                <div>
                  <label className="label text-xs">Frequency</label>
                  <select 
                    value={form.frequency}
                    onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                    className="input h-10 text-sm"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
                
                <div>
                  <label className="label text-xs">Description (Optional)</label>
                  <textarea 
                    placeholder="What will this habit help you achieve?"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="input min-h-[70px] py-2 text-sm" 
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="btn btn-secondary flex-1 h-10 text-base font-bold"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary flex-1 h-10 text-base font-bold shadow-lg shadow-primary-500/20"
                  >
                    {editingHabit ? 'Save' : 'Create'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModalOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteModalOpen(false)}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="card w-full max-w-sm relative z-10 p-8 shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-red-100 dark:bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mx-auto mb-6">
                <AlertTriangle className="w-8 h-8" />
              </div>
              
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Delete Habit</h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium mb-8">
                Are you sure you want to delete <span className="text-slate-900 dark:text-white font-bold italic">'{habitToDelete?.title}'</span>? This action cannot be undone.
              </p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeleteModalOpen(false)}
                  className="btn bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 flex-1 h-12 font-bold transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteHabit}
                  className="btn bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20 flex-1 h-12 font-bold transition-all"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Dashboard
