import { motion } from 'framer-motion'
import { CreditCard, Star, Check, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const Billing = () => {
  const navigate = useNavigate()

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
          <h2 className="text-3xl font-bold tracking-tight">Billing & Plans</h2>
          <p className="text-slate-500">Manage your subscription and billing details.</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="p-8 bg-gradient-to-br from-primary-500 to-indigo-600 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-primary-100 font-medium">Current Plan</p>
              <h3 className="text-4xl font-black mt-1">Free Tier</h3>
            </div>
            <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl">
              <Star className="w-8 h-8 text-white" />
            </div>
          </div>
          <div className="mt-8 flex items-center gap-2 text-primary-100">
            <Check className="w-5 h-5" />
            <p>Up to 5 active habits</p>
          </div>
          <div className="mt-2 flex items-center gap-2 text-primary-100">
            <Check className="w-5 h-5" />
            <p>Basic analytics</p>
          </div>
        </div>
        
        <div className="p-8 space-y-6">
          <div className="p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white">Billing features coming soon</h4>
              <p className="text-sm text-slate-500 max-w-xs">
                We're working on advanced features like unlimited habits and custom categories.
              </p>
            </div>
          </div>

          <button disabled className="btn btn-primary w-full py-4 opacity-50 cursor-not-allowed">
            Upgrade to Pro
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default Billing
