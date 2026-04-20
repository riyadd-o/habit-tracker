import { motion } from 'framer-motion'
import { X } from 'lucide-react'

const TermsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  const sections = [
    {
      title: "1. Acceptance of Terms",
      content: "By creating an account on HabitFlow, you agree to comply with and be bound by these Terms of Service. If you do not agree, please do not use our platform."
    },
    {
      title: "2. Privacy & Security",
      content: "We take your privacy seriously. Your data is encrypted and stored securely. We do not sell your personal information to third parties. You are responsible for maintaining the security of your account and password."
    },
    {
      title: "3. User Responsibilities",
      content: "You agree to use HabitFlow only for lawful purposes. You are responsible for all activity that occurs under your account. Any abuse of the system may lead to permanent termination of your access."
    },
    {
      title: "4. Personal Use Only",
      content: "Our service is intended for personal habit tracking. Commercial use of the platform without explicit permission is prohibited."
    },
    {
      title: "5. Service Modifications",
      content: "We reserve the right to modify or discontinue any part of the service at any time. We will notify users of any significant changes to these terms."
    }
  ]

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        className="card w-full max-w-2xl relative z-10 p-0 shadow-2xl overflow-hidden bg-white dark:bg-slate-900 border-none max-h-[85vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-primary-500/10 rounded-xl flex items-center justify-center">
                <div className="w-3 h-3 bg-primary-500 rounded-full animate-pulse" />
             </div>
             <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">Terms of Service</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Effective April 2026</p>
             </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl transition-all shadow-sm active:scale-90"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-8">
           {sections.map((section, i) => (
             <div key={i} className="space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                   <span className="w-1.5 h-4 bg-primary-500 rounded-full" />
                   {section.title}
                </h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed pl-3.5 border-l border-slate-100 dark:border-slate-800">
                   {section.content}
                </p>
             </div>
           ))}
           
           <div className="p-4 rounded-2xl bg-primary-500/5 border border-primary-500/10 text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic">
              By clicking "I Understand", you acknowledge that you have read and agreed to these terms. If you have any questions, please contact support@habitflow.io.
           </div>
        </div>
        
        {/* Footer */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
           <button 
             onClick={onClose} 
             className="btn btn-primary w-full h-14 font-black text-lg shadow-xl shadow-primary-500/20 active:scale-[0.98] transition-all"
           >
             I Understand
           </button>
        </div>
      </motion.div>
    </div>
  )
}

export default TermsModal
