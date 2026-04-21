import { Check, Flame, Calendar, Trash2, Edit2, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import useHabitStore from '../hooks/useHabitStore'

const HabitCard = ({ habit, toggleCompletion, onDelete, onEdit }) => {
  const navigate = useNavigate()
  const { getHabitStreak, togglingHabitId } = useHabitStore()
  
  const isCompletedToday = habit.completed
  const streak = habit.streak || 0
  const isAtRisk = habit.diffDays >= 2 && habit.diffDays <= 4 && !isCompletedToday
  const isToggling = togglingHabitId === habit.id

  return (
    <motion.div
      layout
      className={`card p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6 group hover:translate-y-[-2px] transition-all bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 ${isCompletedToday ? 'border-primary-500/50 shadow-lg shadow-primary-500/5' : ''}`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-2">
          <h3 className={`text-lg font-bold truncate group-hover:text-primary-600 transition-colors ${isCompletedToday ? 'text-slate-400' : ''}`}>
            {habit.title}
          </h3>
          <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${
            habit.frequency === 'daily' 
            ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' 
            : 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400'
          }`}>
            {habit.frequency || 'daily'}
          </span>
        </div>
        <p className={`text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 ${isCompletedToday ? 'opacity-50' : ''}`}>
          {habit.description || 'No description provided'}
        </p>
        
        <div className="flex items-center gap-4">
          {streak > 0 && (
            <div className={`flex items-center gap-1.5 px-2.5 py-1 ${isAtRisk ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' : 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'} rounded-lg`}>
              {isAtRisk ? (
                <div className="flex items-center gap-1.5">
                  <span className="animate-pulse">⚠️</span>
                  <span className="text-xs font-bold leading-none">Streak at risk</span>
                </div>
              ) : (
                <>
                  <Flame className={`w-4 h-4 ${streak > 0 ? 'fill-current' : ''}`} />
                  <span className="text-xs font-bold leading-none">{streak} day streak</span>
                </>
              )}
            </div>
          )}
          {streak === 0 && !isAtRisk && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 dark:bg-slate-900/40 text-slate-400 rounded-lg">
              <Flame className="w-4 h-4" />
              <span className="text-xs font-bold leading-none">0 day streak</span>
            </div>
          )}
          <button 
            onClick={() => navigate(`/habit/${habit.id}`)}
            className="text-xs font-semibold text-slate-400 hover:text-primary-500 transition-colors flex items-center gap-1"
          >
            <Calendar className="w-4 h-4" />
            View Detail
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto self-stretch sm:self-center">
        <button
          onClick={() => toggleCompletion(habit.id)}
          disabled={isToggling || isCompletedToday}
          className={`flex-1 sm:flex-initial min-w-[120px] flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
            isCompletedToday 
            ? 'bg-green-500 text-white shadow-lg shadow-green-500/20 hover:bg-green-600' 
            : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-primary-500 hover:ring-2 hover:ring-primary-500 dark:hover:text-primary-400'
          } ${isToggling ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
        >
          {isToggling ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : isCompletedToday ? (
            <>
              <Check className="w-5 h-5 stroke-[3px]" />
              Done
            </>
          ) : isAtRisk ? (
            <>
              <Flame className="w-5 h-5 text-orange-400" />
              Restore
            </>
          ) : (
            <>
              <span className="w-5 h-5 rounded-full border-2 border-current" />
              Complete
            </>
          )}
        </button>

        <div className="flex flex-col gap-2">
          <button 
            onClick={() => onEdit(habit)}
            className="p-2.5 text-slate-300 hover:text-slate-600 dark:hover:text-slate-100 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onDelete()}
            className="p-2.5 text-slate-300 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}


export default HabitCard
