import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, CheckCircle2, ArrowLeft, Loader2, Send } from 'lucide-react'
import { motion } from 'framer-motion'
import ThemeToggle from '../components/ThemeToggle'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) return setError('Email is required')
    
    setIsLoading(true)
    setMessage('')
    setError('')

    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
      const response = await fetch(`${baseUrl}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()
      
      if (response.ok) {
        setSubmittedEmail(email)
        setMessage(data.message)
      } else {
        setError(data.error || 'Something went wrong')
      }
    } catch (err) {
      setError('Connection error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 transition-colors duration-300 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-10 dark:opacity-20">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-500 rounded-full blur-[120px]" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full blur-[120px]" />
      </div>

      <div className="absolute top-4 left-4">
        <Link to="/login" className="flex items-center gap-2 text-slate-500 hover:text-primary-500 transition-colors font-medium">
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Login</span>
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
              <Mail className="w-10 h-10" />
           </div>
           <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Forgot Password?</h2>
           <p className="text-slate-500 dark:text-slate-400 font-medium">No worries, we'll send you reset instructions.</p>
        </div>

        {message ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-center space-y-4"
          >
            <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Check your email</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                We’ve sent a password reset link to <span className="font-bold text-slate-900 dark:text-slate-200">{submittedEmail}</span>. Please click the link in your inbox to continue.
              </p>
            </div>
            <Link to="/login" className="btn btn-primary w-full h-12 flex items-center justify-center font-bold">Return to Login</Link>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            <div className="space-y-1.5">
              <label className="label ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                <input 
                  type="email" 
                  placeholder="name@example.com" 
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (error) setError('')
                  }}
                  className={`input h-14 pl-12 bg-white/50 dark:bg-slate-800/50 shadow-sm ${error && !email ? 'border-red-500 shadow-red-500/10' : ''}`}
                />
              </div>
              {error && !email && <p className="text-red-500 text-xs mt-1 ml-1 font-medium">Required</p>}
            </div>

            {error && email && <p className="text-red-500 text-sm font-medium text-center bg-red-50 dark:bg-red-900/10 py-2 rounded-lg border border-red-100 dark:border-red-900/20">{error}</p>}

            <button 
              type="submit" 
              disabled={isLoading}
              className="btn btn-primary w-full h-14 text-lg font-bold flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-primary-500/25"
            >
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                <>
                  <span>Send Reset Link</span>
                  <Send className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  )
}

export default ForgotPassword
