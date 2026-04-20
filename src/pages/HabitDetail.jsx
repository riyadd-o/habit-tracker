import { useParams, useNavigate } from 'react-router-dom'
import { useMemo } from 'react'
import useHabitStore from '../hooks/useHabitStore'
import { ArrowLeft, Flame, Calendar as CalendarIcon, TrendingUp, History, Info, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, subDays, startOfYear } from 'date-fns'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

const HabitDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { habits, logs, getHabitStreak, toggleCompletion, initialized } = useHabitStore()

  const habit = habits.find(h => String(h.id) === String(id))
  const habitLogs = useMemo(() => {
    return logs
      .filter(l => String(l.habit_id) === String(id))
      .map(l => ({
        ...l,
        dateStr: new Date(l.date).toISOString().split('T')[0]
      }))
  }, [id, logs])

  const streak = useMemo(() => getHabitStreak(id), [id, getHabitStreak, logs])

  // Calendar stats (Heatmap)
  const calendarDays = useMemo(() => {
    const end = new Date()
    const start = subDays(end, 89) // Last 90 days including today
    return eachDayOfInterval({ start, end }).map(day => {
      const dateStr = format(day, 'yyyy-MM-dd')
      const isCompleted = habitLogs.some(l => l.dateStr === dateStr)
      return { date: day, isCompleted, dateStr }
    })
  }, [habitLogs])


  // Chart data (Last 30 days)
  const chartData = useMemo(() => {
    const data = []
    for (let i = 29; i >= 0; i--) {
      const date = subDays(new Date(), i)
      const dateStr = format(date, 'yyyy-MM-dd')
      data.push({
        name: format(date, 'MMM dd'),
        completed: habitLogs.some(l => l.dateStr === dateStr) ? 1 : 0
      })
    }
    return data
  }, [habitLogs])

  if (!initialized) return <div className="h-full flex items-center justify-center py-20 animate-fade-in"><Loader2 className="animate-spin text-primary-500 w-10 h-10" /></div>
  if (!habit) return <div className="p-10 text-center"><h3 className="text-xl font-bold">Habit not found</h3><button onClick={() => navigate('/dashboard')} className="btn btn-primary mt-4">Go Back</button></div>

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      <button 
        onClick={() => navigate('/dashboard')}
        className="btn btn-ghost flex items-center gap-2 group mb-6 px-0 hover:bg-transparent"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="font-semibold text-slate-500">Back to Dashboard</span>
      </button>

      {/* Hero */}
      <section className="flex flex-col md:flex-row items-start justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <h2 className="text-4xl font-extrabold tracking-tight">{habit.title}</h2>
             <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                habit.frequency === 'daily' 
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' 
                : 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400'
              }`}>
                {habit.frequency}
              </span>
          </div>
          <p className="text-xl text-slate-500 max-w-2xl">{habit.description || 'No description provided'}</p>
        </div>

        <div className="flex gap-4">
          <div className="card p-4 flex flex-col items-center min-w-[120px]">
            <Flame className="w-6 h-6 text-orange-500 mb-1 fill-orange-500" />
            <div className="text-2xl font-black">{streak.current}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Current Streak</div>
          </div>
          <div className="card p-4 flex flex-col items-center min-w-[120px]">
            <TrendingUp className="w-6 h-6 text-primary-500 mb-1" />
            <div className="text-2xl font-black">{streak.longest}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Longest Streak</div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Heatmap/Calendar */}
        <section className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-primary-500" />
              Activity History
            </h3>
            <span className="text-xs text-slate-400 font-medium">Last 90 Days</span>
          </div>
          <div className="card p-6">
            <div className="flex flex-wrap gap-2 justify-center">
              {calendarDays.map((day, i) => (
                <div 
                  key={i}
                  title={day.dateStr}
                  className={`w-4 h-4 rounded-[2px] cursor-pointer transition-all hover:scale-125 ${
                    day.isCompleted 
                    ? 'bg-primary-500 shadow-sm shadow-primary-500/20' 
                    : 'bg-slate-100 dark:bg-slate-800'
                  }`}
                  onClick={() => toggleCompletion(id, day.date.toISOString())}
                />
              ))}
            </div>
            <div className="mt-8 flex items-center justify-center gap-6 text-xs text-slate-400 font-bold uppercase tracking-widest">
               <div className="flex items-center gap-2">
                 <div className="w-3 h-3 bg-slate-100 dark:bg-slate-800 rounded-sm" />
                 <span>Missed</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-3 h-3 bg-primary-500 rounded-sm" />
                 <span>Completed</span>
               </div>
            </div>
          </div>
        </section>

        {/* Analytics Table/Insights */}
        <section className="space-y-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-500" />
            Quick Insights
          </h3>
          <div className="card p-6 space-y-6">
            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 font-medium">Completion Rate</span>
              <span className="font-bold">
                {Math.round((habitLogs.length / (calendarDays.length || 1)) * 100)}%
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 font-medium">Total Check-ins</span>
              <span className="font-bold">{habitLogs.length}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-slate-500 font-medium">Consistency Rank</span>
              <span className="text-primary-600 dark:text-primary-400 font-bold uppercase text-xs tracking-widest bg-primary-500/10 px-2 py-1 rounded">
                Gold
              </span>
            </div>
          </div>
        </section>

        {/* Chart */}
        <section className="lg:col-span-3 space-y-4">
           <h3 className="text-xl font-bold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-500" />
            Visual Progress (Last 30 Days)
          </h3>
          <div className="card p-6 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="name" tick={{fontSize: 10}} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#14532d' }}
                />
                <Area type="monotone" dataKey="completed" stroke="#22c55e" fillOpacity={1} fill="url(#colorCompleted)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </div>
  )
}

export default HabitDetail
