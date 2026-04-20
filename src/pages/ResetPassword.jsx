import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { Lock, CheckCircle2, AlertCircle, Loader2, Save } from 'lucide-react'
import { motion } from 'framer-motion'
import ThemeToggle from '../components/ThemeToggle'

const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')

  const validate = () => {
    const newErrors = {}
    if (!password) {
      newErrors.password = 'Required'
    } else if (password.length < 3) {
      newErrors.password = 'Password must be at least 3 characters'
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Required'
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError('')
    
    if (!validate()) return

    setIsLoading(true)
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'https://habit-tracker-qcn7.onrender.com'
      const response = await fetch(`${baseUrl}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      })

      const data = await response.json()
      
      if (response.ok) {
        setIsSuccess(true)
        setTimeout(() => navigate('/login'), 3000)
      } else {
        setApiError(data.error || 'Something went wrong')
      }
    } catch (err) {
      setApiError('Connection error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field, value, setter) => {
    setter(value)
    if (errors[field]) {
      setErrors({ ...errors, [field]: null })
    }
    if (apiError) setApiError('')
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
        <div className="card max-w-md p-10 text-center space-y-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
          <h2 className="text-2xl font-bold">Invalid Link</h2>
          <p className="text-slate-500">The password reset link is missing or invalid.</p>
          <Link to="/forgot-password" className="btn btn-primary block">Request New Link</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 transition-colors duration-300 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-10 dark:opacity-20">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-500 rounded-full blur-[120px]" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full blur-[120px]" />
      </div>

      <div className="absolute top-4 right-4"><ThemeToggle /></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card w-full max-w-md p-10 space-y-8 shadow-2xl relative z-10 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-white/20"
      >
        <div className="text-center space-y-2">
           <div className="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center text-white mx-auto shadow-xl shadow-primary-500/30 mb-6 group hover:scale-110 transition-all cursor-pointer">
              <Lock className="w-10 h-10" />
           </div>
           <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">New Password</h2>
           <p className="text-slate-500 dark:text-slate-400 font-medium">Please enter your new password below.</p>
        </div>

        {isSuccess ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-center space-y-3"
          >
            <CheckCircle2 className="w-10 h-10 mx-auto" />
            <h3 className="font-bold text-xl">Password Updated!</h3>
            <p className="font-medium text-sm">Your password has been reset successfully. Redirecting you to login...</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="label ml-1">New Password</label>
                <div className="relative group">
                  <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 ${errors.password ? 'text-red-400' : 'text-slate-400 group-focus-within:text-primary-500'} transition-colors`} />
                  <input 
                    type="password" 
                    placeholder="Min 3 characters" 
                    value={password}
                    onChange={(e) => handleInputChange('password', e.target.value, setPassword)}
                    className={`input h-14 pl-12 bg-white/50 dark:bg-slate-800/50 shadow-sm ${errors.password ? 'border-red-500 shadow-red-500/10' : ''}`}
                  />
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1 ml-1 font-medium">{errors.password}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="label ml-1">Confirm New Password</label>
                <div className="relative group">
                  <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 ${errors.confirmPassword ? 'text-red-400' : 'text-slate-400 group-focus-within:text-primary-500'} transition-colors`} />
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    value={confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value, setConfirmPassword)}
                    className={`input h-14 pl-12 bg-white/50 dark:bg-slate-800/50 shadow-sm ${errors.confirmPassword ? 'border-red-500 shadow-red-500/10' : ''}`}
                  />
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 ml-1 font-medium">{errors.confirmPassword}</p>}
              </div>
            </div>

            {apiError && (
              <div className="flex items-center gap-2 justify-center text-red-500 text-sm font-bold bg-red-50 dark:bg-red-900/10 p-3 rounded-lg border border-red-100 dark:border-red-900/20">
                <AlertCircle className="w-4 h-4" />
                <span>{apiError}</span>
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className="btn btn-primary w-full h-14 text-lg font-bold flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-primary-500/25"
            >
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                <>
                  <span>Reset Password</span>
                  <Save className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  )
}

export default ResetPassword
