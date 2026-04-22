import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ListTodo, Plus, Search, Filter, HelpCircle, X, CheckCircle2, Flame, Award, AlertTriangle, Loader2 } from 'lucide-react'
import useHabitStore from '../hooks/useHabitStore'
import HabitCard from '../components/HabitCard'
import Modal from '../components/Modal'

const Habits = () => {
  const { habits, toggleCompletion, deleteHabit, updateHabit, getHabitStreak } = useHabitStore()
  const [showGuide, setShowGuide] = useState(false)
  
  // Modal States
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [habitToDelete, setHabitToDelete] = useState(null)
  const [habitToEdit, setHabitToEdit] = useState(null)
  const [editForm, setEditForm] = useState({ title: '', description: '', frequency: 'daily' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const stats = useMemo(() => {
    const total = habits.length
    const completedToday = habits.filter(h => h.completed).length
    const rate = total > 0 ? Math.round((completedToday / total) * 100) : 0
    const streaks = habits.reduce((acc, h) => acc + getHabitStreak(h.id).current, 0)
    
    return { total, rate, streaks }
  }, [habits, getHabitStreak])

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

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Your Habits</h2>
          <p className="text-slate-500">Manage and track all your daily routines in one place.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 border-l-4 border-primary-500 bg-white dark:bg-slate-900 shadow-sm">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Active Habits</p>
          <p className="text-3xl font-black">{stats.total}</p>
        </div>
        <div className="card p-6 border-l-4 border-blue-500 bg-white dark:bg-slate-900 shadow-sm">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Today's Progress</p>
          <p className="text-3xl font-black">{stats.rate}%</p>
        </div>
        <div className="card p-6 border-l-4 border-purple-500 bg-white dark:bg-slate-900 shadow-sm">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Total Streaks</p>
          <p className="text-3xl font-black">{stats.streaks}</p>
        </div>
      </div>

      <div className="space-y-4">
        {habits.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {habits.map(habit => (
              <HabitCard 
                key={habit.id}
                habit={habit}
                toggleCompletion={toggleCompletion}
                onDelete={confirmDelete}
                onEdit={openEditModal}
              />
            ))}
          </div>
        ) : (
          <div className="card p-20 flex flex-col items-center justify-center text-center bg-slate-50/50 dark:bg-slate-900/50 border-dashed border-2">
            <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <ListTodo className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">No habits listed yet</h3>
            <p className="text-slate-500 max-w-sm mb-8">
              You haven't created any habits yet. Go to the Dashboard to set up your first routine!
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-center pt-8">
        <button 
          onClick={() => setShowGuide(true)}
          className="btn btn-secondary flex items-center gap-2"
        >
          <HelpCircle className="w-4 h-4" />
          Learn How it Works
        </button>
      </div>

      {/* Guide Modal */}
      <Modal
        isOpen={showGuide}
        onClose={() => setShowGuide(false)}
        title="How HabitFlow Works"
        footer={
          <button 
            onClick={() => setShowGuide(false)}
            className="btn btn-primary w-full h-12 font-bold text-lg rounded-xl"
          >
            Got it, let's go!
          </button>
        }
      >
        <div className="space-y-6 py-2">
          <div className="flex gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <div className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">1</div>
            <div>
              <h4 className="font-bold flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-500" />
                Create a Habit
              </h4>
              <p className="text-sm text-slate-500 mt-1">Add tasks you want to repeat daily or weekly. Set a title and description to stay motivated.</p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <div className="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">2</div>
            <div>
              <h4 className="font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Daily Check-ins
              </h4>
              <p className="text-sm text-slate-500 mt-1">Mark your habits as "Done" every day. Each completion records a log in our database to track your journey.</p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <div className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">3</div>
            <div>
              <h4 className="font-bold flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" />
                Build Streaks
              </h4>
              <p className="text-sm text-slate-500 mt-1">Consistency is key! Completing habits on consecutive days builds your streak. Don't break the chain!</p>
            </div>
          </div>
        </div>
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

export default Habits

