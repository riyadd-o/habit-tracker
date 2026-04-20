import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, CheckCircle2, LayoutDashboard, Loader2 } from 'lucide-react'
import useAuthStore from '../hooks/useAuthStore'
import { motion } from 'framer-motion'
import ThemeToggle from '../components/ThemeToggle'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const validate = () => {
    const newErrors = {}
    if (!email) newErrors.email = 'Required'
    if (!password) newErrors.password = 'Required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError('')
    
    if (!validate()) return

    setIsLoading(true)
    try {
      // We expect the store to handle success toast, but we handle the error locally if it fails
      const success = await login(email, password)
      if (success) {
        navigate('/dashboard')
      } else {
        // This assumes useAuthStore returns false on failure
        // We might need to adjust the store to return more info or rely on toast
        // For now, let's assume if it returns false, something went wrong
        setApiError('Invalid email or password')
      }
    } catch (err) {
      setApiError('An unexpected error occurred')
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

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 transition-colors duration-300 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-10 dark:opacity-20">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-500 rounded-full blur-[120px]" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full blur-[120px]" />
      </div>

      <div className="absolute top-4 left-4">
        <Link to="/" className="flex items-center gap-2 text-slate-500 hover:text-primary-500 transition-colors font-medium">
          <LayoutDashboard className="w-5 h-5" />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="absolute top-4 right-4"><ThemeToggle /></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card w-full max-w-md p-10 space-y-8 shadow-2xl relative z-10 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-white/20"
      >
        <div className="text-center space-y-2">
           <div className="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center text-white mx-auto shadow-xl shadow-primary-500/30 mb-6 group hover:scale-110 transition-all cursor-pointer">
              <CheckCircle2 className="w-10 h-10" />
           </div>
           <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Welcome Back</h2>
           <p className="text-slate-500 dark:text-slate-400 font-medium">Log in to track your progress today.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="label ml-1">Email Address</label>
              <div className="relative group">
                <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 ${errors.email ? 'text-red-400' : 'text-slate-400 group-focus-within:text-primary-500'} transition-colors`} />
                <input 
                  type="email" 
                  placeholder="name@example.com" 
                  value={email}
                  onChange={(e) => handleInputChange('email', e.target.value, setEmail)}
                  className={`input h-14 pl-12 bg-white/50 dark:bg-slate-800/50 shadow-sm ${errors.email ? 'border-red-500 focus:ring-red-500/20' : ''}`}
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1 ml-1 font-medium">{errors.email}</p>}
            </div>
            
            <div className="space-y-1.5">
              <div className="flex items-center justify-between ml-1">
                <label className="label">Password</label>
                <Link to="/forgot-password" virtual="true" className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline">Forgot Password?</Link>
              </div>
              <div className="relative group">
                <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 ${errors.password ? 'text-red-400' : 'text-slate-400 group-focus-within:text-primary-500'} transition-colors`} />
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => handleInputChange('password', e.target.value, setPassword)}
                  className={`input h-14 pl-12 bg-white/50 dark:bg-slate-800/50 shadow-sm ${errors.password ? 'border-red-500 focus:ring-red-500/20' : ''}`}
                />
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1 ml-1 font-medium">{errors.password}</p>}
            </div>
          </div>

          {apiError && (
             <div className="text-red-500 text-sm font-bold text-center bg-red-50 dark:bg-red-900/10 py-2 rounded-lg border border-red-100 dark:border-red-900/20">
               {apiError}
             </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            className="btn btn-primary w-full h-14 text-lg font-bold flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-primary-500/25"
          >
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Log In'}
          </button>
        </form>

        <div className="text-center">
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Don't have an account? {' '}
            <Link to="/register" className="text-primary-600 dark:text-primary-400 font-bold hover:underline underline-offset-4 decoration-2">Sign Up</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default Login
