import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Mail, Clock, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { updateNotifications, getUserSettings } from '../../services/userService'

const Notifications = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [settings, setSettings] = useState({
    email_notifications: true,
    daily_reminder: true,
    reminder_time: '08:00'
  })
  const [originalSettings, setOriginalSettings] = useState({
    email_notifications: true,
    daily_reminder: true,
    reminder_time: '08:00'
  })

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await getUserSettings()
        const initial = {
          email_notifications: data.email_notifications,
          daily_reminder: data.daily_reminder,
          reminder_time: data.reminder_time ? data.reminder_time.substring(0, 5) : '08:00'
        }
        setSettings(initial)
        setOriginalSettings(initial)
      } catch (err) {
        toast.error('Failed to load notification settings')
      } finally {
        setFetching(false)
      }
    }
    fetchSettings()
  }, [])

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleTimeChange = (e) => {
    setSettings(prev => ({ ...prev, reminder_time: e.target.value }))
  }

  const handleSave = async () => {
    if (JSON.stringify(settings) === JSON.stringify(originalSettings)) return
    
    setLoading(true)
    try {
      await updateNotifications(settings)
      setOriginalSettings({ ...settings })
      toast.success('Notification settings saved')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl space-y-8"
    >
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/settings')}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
          <p className="text-slate-500">Choose how and when you want to be notified.</p>
        </div>
      </div>

      <div className="card p-8 space-y-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center text-primary-500">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold">Email Notifications</h3>
                <p className="text-sm text-slate-500">Receive weekly summaries and tips</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle('email_notifications')}
              className={`w-12 h-6 rounded-full transition-colors relative ${settings.email_notifications ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-700'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.email_notifications ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold">Daily Habit Reminders</h3>
                <p className="text-sm text-slate-500">Get reminded to complete your habits</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle('daily_reminder')}
              className={`w-12 h-6 rounded-full transition-colors relative ${settings.daily_reminder ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-700'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.daily_reminder ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          <AnimatePresence>
            {settings.daily_reminder && (
              <motion.div 
                initial={{ height: 0, opacity: 0, marginTop: 0 }}
                animate={{ height: 'auto', opacity: 1, marginTop: 24 }}
                exit={{ height: 0, opacity: 0, marginTop: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div>
                    <h3 className="font-bold">Reminder Time</h3>
                    <p className="text-sm text-slate-500">Choose what time you want to receive your daily reminder</p>
                  </div>
                  <input 
                    type="time" 
                    value={settings.reminder_time}
                    onChange={handleTimeChange}
                    className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none font-bold text-slate-700 dark:text-slate-200"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        <div className="pt-4">
          <button
            onClick={handleSave}
            disabled={loading || JSON.stringify(settings) === JSON.stringify(originalSettings)}
            className="btn btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Save Preferences'
            )}
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default Notifications
