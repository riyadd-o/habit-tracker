import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, LogIn, CheckCircle2, AlertCircle, LayoutDashboard } from 'lucide-react'
import useAuthStore from '../hooks/useAuthStore'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [errors, setErrors] = useState({})
  
  const navigate = useNavigate()
  const { login } = useAuthStore()

  const validate = () => {
    const newErrors = {}
    if (!email) newErrors.email = 'Required'
    if (!password) newErrors.password = 'Required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!validate()) return
    
    setLoading(true)
    
    try {
      const success = await login(email, password)
      if (success) {
        navigate('/dashboard')
      } else {
        setError('Invalid email or password')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value, setter) => {
    setter(value)
    if (errors[field]) {
      setErrors({ ...errors, [field]: null })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-10 dark:opacity-20">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-500 rounded-full blur-[120px]" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full blur-[120px]" />
      </div>

      <div className="absolute top-4 left-4 z-20">
        <Link to="/" className="flex items-center gap-2 text-slate-500 hover:text-primary-500 transition-colors font-medium">
          <LayoutDashboard className="w-5 h-5" />
          <span>Back</span>
        </Link>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full relative z-10"
      >
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-3 mb-6 group">
            <div className="w-12 h-12 bg-primary-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary-500/30 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">HabitFlow</h1>
          </Link>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Sign In</h2>
          <p className="text-slate-500 mt-2">Welcome back! Please enter your details.</p>
        </div>

        <div className="card p-8 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-white/20">
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {error && (
              <div className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 p-4 rounded-xl flex items-center gap-3 text-red-600 text-sm animate-shake">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="font-medium">{error}</p>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2 px-1">
                Email Address
              </label>
              <div className="relative group">
                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${errors.email ? 'text-red-400' : 'text-slate-400 group-focus-within:text-primary-500'} transition-colors`} />
                <input 
                  type="email" 
                  placeholder="name@company.com"
                  className={`input pl-12 h-13 ${errors.email ? 'border-red-500 focus:ring-red-500/20' : ''}`}
                  value={email}
                  onChange={(e) => handleInputChange('email', e.target.value, setEmail)}
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1 ml-1 font-medium">{errors.email}</p>}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between mb-2 px-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Password
                </label>
                <Link to="/forgot-password" title="Forgot Password?" className="text-xs font-bold text-primary-600 hover:text-primary-700 transition-colors">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative group">
                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${errors.password ? 'text-red-400' : 'text-slate-400 group-focus-within:text-primary-500'} transition-colors`} />
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className={`input pl-12 h-13 ${errors.password ? 'border-red-500 focus:ring-red-500/20' : ''}`}
                  value={password}
                  onChange={(e) => handleInputChange('password', e.target.value, setPassword)}
                />
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1 ml-1 font-medium">{errors.password}</p>}
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full h-13 text-lg font-bold shadow-lg shadow-primary-500/20 mt-2 active:scale-95 transition-all"
            >
              {loading ? (
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <LogIn className="w-5 h-5" />
                  Sign In
                </div>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-primary-600 hover:text-primary-700 transition-colors">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Login
