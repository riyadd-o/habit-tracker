import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ListTodo, Plus, Search, Filter, HelpCircle, X, CheckCircle2, Flame, Award } from 'lucide-react'
import useHabitStore from '../hooks/useHabitStore'
import HabitCard from '../components/HabitCard'

const Habits = () => {
  const { habits, toggleCompletion, deleteHabit, getHabitStreak } = useHabitStore()
  const [showGuide, setShowGuide] = useState(false)
  
  const stats = useMemo(() => {
    const total = habits.length
    const completedToday = habits.filter(h => h.completed).length
    const rate = total > 0 ? Math.round((completedToday / total) * 100) : 0
    const streaks = habits.reduce((acc, h) => acc + getHabitStreak(h.id).current, 0)
    
    return { total, rate, streaks }
  }, [habits, getHabitStreak])

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
                onDelete={deleteHabit}
                onEdit={() => {}} // Could link to dashboard edit if needed
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
      <AnimatePresence>
        {showGuide && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowGuide(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="card w-full max-w-lg relative z-10 p-8 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => setShowGuide(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary-500/10 text-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <HelpCircle className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold">How HabitFlow Works</h3>
                <p className="text-slate-500">Master your consistency in 3 simple steps</p>
              </div>

              <div className="space-y-6">
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

              <button 
                onClick={() => setShowGuide(false)}
                className="btn btn-primary w-full h-12 mt-8 font-bold text-lg"
              >
                Got it, let's go!
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Habits

