import { useState, useMemo, useEffect } from 'react'
import useAuthStore from '../hooks/useAuthStore'
import useHabitStore from '../hooks/useHabitStore'
import HabitCard from '../components/HabitCard'
import Modal from '../components/Modal'
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
  
  // Modal States
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  
  const [habitToDelete, setHabitToDelete] = useState(null)
  const [habitToEdit, setHabitToEdit] = useState(null)
  
  const [form, setForm] = useState({ title: '', description: '', frequency: 'daily' })
  const [editForm, setEditForm] = useState({ title: '', description: '', frequency: 'daily' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchHabits()
  }, [])

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
    setIsSubmitting(true)
    const success = await addHabit(form)
    if (success) {
      setCreateModalOpen(false)
      setForm({ title: '', description: '', frequency: 'daily' })
    }
    setIsSubmitting(false)
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!habitToEdit) return
    setIsSubmitting(true)
    const success = await updateHabit(habitToEdit.id, editForm)
    if (success) {
      setEditModalOpen(false)
      setHabitToEdit(null)
    }
    setIsSubmitting(false)
  }

  const confirmDelete = (habit) => {
    setHabitToDelete(habit)
    setDeleteModalOpen(true)
  }

  const openEditModal = (habit) => {
    setHabitToEdit(habit)
    setEditForm({ 
      title: habit.title, 
      description: habit.description || '', 
      frequency: habit.frequency || 'daily' 
    })
    setEditModalOpen(true)
  }

  const handleDeleteHabit = async () => {
    if (habitToDelete) {
      setIsSubmitting(true)
      await deleteHabit(habitToDelete.id)
      setDeleteModalOpen(false)
      setHabitToDelete(null)
      setIsSubmitting(false)
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
            onClick={() => setCreateModalOpen(true)}
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
                toggleCompletion={() => toggleCompletion(habit.id)}
                onDelete={() => confirmDelete(habit)}
                onEdit={openEditModal}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* CREATE MODAL */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New Habit"
        footer={
          <div className="flex gap-3">
            <button 
              onClick={() => setCreateModalOpen(false)}
              className="btn flex-1 bg-slate-100 dark:bg-slate-800 h-12 rounded-xl font-bold text-slate-600 dark:text-slate-300"
            >
              Cancel
            </button>
            <button 
              onClick={handleCreateSubmit}
              disabled={isSubmitting || !form.title.trim()}
              className="btn flex-1 btn-primary h-12 rounded-xl font-bold shadow-lg shadow-primary-500/20"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Create Habit'}
            </button>
          </div>
        }
      >
        <form onSubmit={handleCreateSubmit} className="space-y-6">
          <div>
            <label className="text-[10px] font-bold uppercase text-primary-600 block mb-2 px-1">Habit Title</label>
            <input 
              required 
              autoFocus
              placeholder="e.g. Read for 30 minutes"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="input h-12 bg-slate-50 dark:bg-slate-800/50" 
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-primary-600 block mb-2 px-1">Description (Optional)</label>
            <textarea 
              placeholder="Why is this habit important?"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input min-h-[100px] py-3 bg-slate-50 dark:bg-slate-800/50 resize-none" 
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-primary-600 block mb-2 px-1">Frequency</label>
            <select 
              value={form.frequency}
              onChange={(e) => setForm({ ...form, frequency: e.target.value })}
              className="input h-12 bg-slate-50 dark:bg-slate-800/50"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
        </form>
      </Modal>

      {/* EDIT MODAL */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Habit"
        footer={
          <div className="flex gap-3">
            <button 
              onClick={() => setEditModalOpen(false)}
              className="btn flex-1 bg-slate-100 dark:bg-slate-800 h-12 rounded-xl font-bold text-slate-600 dark:text-slate-300"
            >
              Cancel
            </button>
            <button 
              onClick={handleEditSubmit}
              disabled={isSubmitting || !editForm.title.trim()}
              className="btn flex-1 btn-primary h-12 rounded-xl font-bold shadow-lg shadow-primary-500/20"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Save Changes'}
            </button>
          </div>
        }
      >
        <form onSubmit={handleEditSubmit} className="space-y-6">
          <div>
            <label className="text-[10px] font-bold uppercase text-primary-600 block mb-2 px-1">Habit Title</label>
            <input 
              required 
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              className="input h-12 bg-slate-50 dark:bg-slate-800/50" 
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-primary-600 block mb-2 px-1">Description</label>
            <textarea 
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              className="input min-h-[100px] py-3 bg-slate-50 dark:bg-slate-800/50 resize-none" 
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-primary-600 block mb-2 px-1">Frequency</label>
            <select 
              value={editForm.frequency}
              onChange={(e) => setEditForm({ ...editForm, frequency: e.target.value })}
              className="input h-12 bg-slate-50 dark:bg-slate-800/50"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
        </form>
      </Modal>

      {/* DELETE MODAL */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Habit"
        footer={
          <div className="flex gap-3">
            <button 
              onClick={() => setDeleteModalOpen(false)}
              className="btn flex-1 bg-slate-100 dark:bg-slate-800 h-12 rounded-xl font-bold text-slate-600 dark:text-slate-300"
            >
              No, Keep it
            </button>
            <button 
              onClick={handleDeleteHabit}
              disabled={isSubmitting}
              className="btn flex-1 bg-red-500 text-white hover:bg-red-600 h-12 rounded-xl font-bold shadow-lg shadow-red-500/20 transition-all active:scale-95"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Yes, Delete'}
            </button>
          </div>
        }
      >
        <div className="text-center space-y-4 py-4">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-500/10 rounded-3xl flex items-center justify-center text-red-500 mx-auto mb-4">
            <AlertTriangle className="w-10 h-10" />
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
            Are you sure you want to delete <span className="font-bold text-slate-900 dark:text-white">'{habitToDelete?.title}'</span>?
          </p>
          <p className="text-sm text-slate-400">
            This action is permanent and cannot be undone. All streak data will be lost.
          </p>
        </div>
      </Modal>
    </div>
  )
}

export default Dashboard
