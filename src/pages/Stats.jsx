import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, Cell, PieChart, Pie 
} from 'recharts'
import { BarChart3, TrendingUp, Zap, CheckCircle2, Award, Target, Flame } from 'lucide-react'
import useHabitStore from '../hooks/useHabitStore'
import { format, subDays, eachDayOfInterval } from 'date-fns'

const Stats = () => {
  const { habits, logs, getHabitStreak } = useHabitStore()

  // 1. Daily Completion Trends (Last 14 days)
  const dailyData = useMemo(() => {
    const end = new Date()
    const start = subDays(end, 13)
    const interval = eachDayOfInterval({ start, end })

    return interval.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd')
      const count = logs.filter(l => {
        const logDate = new Date(l.date).toISOString().split('T')[0]
        return logDate === dateStr
      }).length
      return {
        name: format(day, 'MMM dd'),
        count
      }
    })
  }, [logs])

  // 2. Habit Consistency (Total completions per habit)
  const habitData = useMemo(() => {
    return habits.map(h => {
      const count = logs.filter(l => l.habit_id == h.id).length
      return {
        name: h.title,
        value: count
      }
    }).sort((a, b) => b.value - a.value).slice(0, 5) // Top 5
  }, [habits, logs])

  // 3. Aggregate Stats
  const aggregateStats = useMemo(() => {
    const totalCheckins = logs.length
    const bestStreak = habits.reduce((max, h) => {
      const { longest } = getHabitStreak(h.id)
      return Math.max(max, longest)
    }, 0)
    const avgCompletion = habits.length > 0 ? Math.round((logs.length / (habits.length * 30)) * 100) : 0 // Rough estimation
    
    return { totalCheckins, bestStreak, avgCompletion }
  }, [habits, logs, getHabitStreak])

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981']

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black tracking-tight">Analytics</h2>
          <p className="text-slate-500 font-medium">Deep dive into your progress and consistency over time.</p>
        </div>
      </div>

      {/* Aggregate Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Check-ins', value: aggregateStats.totalCheckins, icon: CheckCircle2, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'All-Time Best Streak', value: `${aggregateStats.bestStreak} Days`, icon: Award, color: 'text-orange-500', bg: 'bg-orange-500/10' },
          { label: 'Monthly Consistency', value: `${aggregateStats.avgCompletion}%`, icon: Target, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        ].map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={i} 
            className="card p-6 flex items-center gap-6 bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800"
          >
            <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl`}>
              <stat.icon className="w-8 h-8" />
            </div>
            <div>
              <p className="text-3xl font-black">{stat.value}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Trend Chart */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold">Daily Completion Trend</h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  labelStyle={{ fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
        
        {/* Consistency Chart */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold">Habit performance</h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={habitData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" opacity={0.5} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} width={80} />
                <Tooltip 
                   cursor={{ fill: 'transparent' }}
                   contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                  {habitData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Consistency Insights */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 card p-8 bg-gradient-to-br from-primary-600 to-primary-800 text-white shadow-xl"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 text-center md:text-left">
               <h3 className="text-2xl font-bold">You're doing great!</h3>
               <p className="text-primary-100 max-w-md">Your consistency helps build lasting habits. You've completed <strong>{aggregateStats.totalCheckins}</strong> activities so far. Keep pushing to reach your personal best streak of <strong>{aggregateStats.bestStreak} days</strong>!</p>
               <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2">
                  <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/10 backdrop-blur-sm">
                    <Flame className="w-4 h-4 text-orange-400" />
                    <span className="text-xs font-black uppercase tracking-widest">Consistency: {aggregateStats.avgCompletion}%</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/10 backdrop-blur-sm">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span className="text-xs font-black uppercase tracking-widest">Active State: High</span>
                  </div>
               </div>
            </div>
            <div className="shrink-0">
               <div className="relative">
                  <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full" />
                  <div className="relative w-32 h-32 md:w-40 md:h-40 bg-white/10 border-4 border-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                     <Award className="w-16 h-16 md:w-20 md:h-20" />
                  </div>
               </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Stats

