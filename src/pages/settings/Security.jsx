import { useState } from 'react'
import { motion } from 'framer-motion'
import { Lock, Shield, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { changePassword } from '../../services/userService'

const Security = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [currentPasswordError, setCurrentPasswordError] = useState('')
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: ''
  })

  const handleSave = async (e) => {
    e.preventDefault()
    setCurrentPasswordError('')
    
    if (formData.newPassword.length < 3) {
      return toast.error('New password must be at least 3 characters')
    }

    setLoading(true)
    try {
      await changePassword(formData)
      toast.success('Password updated successfully')
      setFormData({ currentPassword: '', newPassword: '' })
    } catch (err) {
      if (err.message.includes('Current password is incorrect')) {
        setCurrentPasswordError('Invalid current Password')
      } else {
        toast.error(err.message)
      }
    } finally {
      setLoading(false)
    }
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
          <h2 className="text-3xl font-bold tracking-tight">Security</h2>
          <p className="text-slate-500">Update your password and secure your account.</p>
        </div>
      </div>

      <div className="card p-8 space-y-8">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Current Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type={showCurrent ? "text" : "password"}
                value={formData.currentPassword}
                onChange={(e) => {
                  setFormData({ ...formData, currentPassword: e.target.value })
                  setCurrentPasswordError('')
                }}
                className={`input pl-10 pr-10 ${currentPasswordError ? 'border-red-500 focus:ring-red-500/20' : ''}`}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showCurrent ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {currentPasswordError && (
              <p className="text-xs text-red-500 font-bold mt-1 scale-in">{currentPasswordError}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type={showNew ? "text" : "password"}
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                className={`input pl-10 pr-10 ${formData.newPassword.length > 0 && formData.newPassword.length < 3 ? 'border-red-500 focus:ring-red-500/20' : ''}`}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Minimum 3 characters long.
            </p>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading || !formData.currentPassword || formData.newPassword.length < 3 || formData.currentPassword.length < 3}
              className="btn btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Update Password'
              )}
            </button>
          </div>
        </form>

        <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4 text-amber-600 bg-amber-50 dark:bg-amber-500/10 p-4 rounded-xl">
            <Shield className="w-6 h-6 shrink-0" />
            <p className="text-sm">
              Two-factor authentication (2FA) is currently not available for your account level.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default Security
