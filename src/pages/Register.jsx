import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, User as UserIcon, CheckCircle2, Loader2, Sparkles, LayoutDashboard } from 'lucide-react'
import useAuthStore from '../hooks/useAuthStore'
import ThemeToggle from '../components/ThemeToggle'
import TermsModal from '../components/TermsModal'

const Register = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [showTerms, setShowTerms] = useState(false)
  
  const { signup } = useAuthStore()
  const navigate = useNavigate()

  const validate = () => {
    const newErrors = {}
    if (!name) newErrors.name = 'Required'
    if (!email) newErrors.email = 'Required'
    if (!password) {
      newErrors.password = 'Required'
    } else if (password.length < 3) {
      newErrors.password = 'Password must be at least 3 characters'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)
    const success = await signup({ name, email, password })
    if (success) {
      navigate('/login')
    }
    setIsLoading(false)
  }

  const handleInputChange = (field, value, setter) => {
    setter(value)
    if (errors[field]) {
      setErrors({ ...errors, [field]: null })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 transition-colors duration-300 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-10 dark:opacity-20 animate-pulse">
         <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-500 rounded-full blur-[120px]" />
         <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500 rounded-full blur-[120px]" />
      </div>

      <div className="absolute top-4 left-4 z-20">
        <Link to="/" className="flex items-center gap-2 text-slate-500 hover:text-primary-500 transition-colors font-medium">
          <LayoutDashboard className="w-5 h-5" />
          <span>Back</span>
        </Link>
      </div>

      <div className="absolute top-4 right-4 z-20"><ThemeToggle /></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card w-full max-w-lg p-10 space-y-8 shadow-2xl relative z-10 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-white/20"
      >
        <div className="flex flex-col items-center justify-center space-y-2 text-center">
            <div className="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary-500/20 mb-6 group cursor-pointer hover:rotate-12 transition-transform">
                <Sparkles className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Join HabitFlow</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm">
                Start building the habits that lead to success. It only takes a minute.
            </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1.5">
              <label className="label ml-1">Full Name</label>
              <div className="relative group">
                <UserIcon className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 ${errors.name ? 'text-red-400' : 'text-slate-400 group-focus-within:text-primary-500'} transition-colors`} />
                <input 
                  type="text" 
                  placeholder="John Doe" 
                  value={name}
                  onChange={(e) => handleInputChange('name', e.target.value, setName)}
                  className={`input h-14 pl-12 bg-white/50 dark:bg-slate-800/50 ${errors.name ? 'border-red-500 focus:ring-red-500/20' : ''}`}
                />
              </div>
              {errors.name && <p className="text-red-500 text-xs mt-1 ml-1 font-medium">{errors.name}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="label ml-1">Email Address</label>
              <div className="relative group">
                <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 ${errors.email ? 'text-red-400' : 'text-slate-400 group-focus-within:text-primary-500'} transition-colors`} />
                <input 
                  type="email" 
                  placeholder="name@example.com" 
                  value={email}
                  onChange={(e) => handleInputChange('email', e.target.value, setEmail)}
                  className={`input h-14 pl-12 bg-white/50 dark:bg-slate-800/50 ${errors.email ? 'border-red-500 focus:ring-red-500/20' : ''}`}
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1 ml-1 font-medium">{errors.email}</p>}
            </div>
            
            <div className="space-y-1.5">
              <label className="label ml-1">Password</label>
              <div className="relative group">
                <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 ${errors.password ? 'text-red-400' : 'text-slate-400 group-focus-within:text-primary-500'} transition-colors`} />
                <input 
                  type="password" 
                  placeholder="Min 3 characters" 
                  value={password}
                  onChange={(e) => handleInputChange('password', e.target.value, setPassword)}
                  className={`input h-14 pl-12 bg-white/50 dark:bg-slate-800/50 ${errors.password ? 'border-red-500 focus:ring-red-500/20' : ''}`}
                />
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1 ml-1 font-medium">{errors.password}</p>}
            </div>
          </div>

          <div className="flex items-center gap-2 px-1">
             <div className="w-5 h-5 rounded-md border border-slate-300 dark:border-slate-700 flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary-500" />
             </div>
             <p className="text-xs text-slate-500 dark:text-slate-400">
                By signing up, you agree to our <span 
                onClick={() => setShowTerms(true)}
                className="font-bold underline cursor-pointer text-slate-600 dark:text-slate-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
              >
                Terms of Service
              </span>.
             </p>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="btn btn-primary w-full h-14 text-lg font-bold flex items-center justify-center gap-3 shadow-xl shadow-primary-500/25 active:scale-95 transition-all"
          >
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Create Free Account'}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 dark:text-primary-400 font-bold hover:underline underline-offset-4 decoration-2 transition-all">Sign In</Link>
          </p>
        </div>
      </motion.div>

      <AnimatePresence>
        {showTerms && (
          <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}

export default Register
