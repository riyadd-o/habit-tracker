import { motion } from 'framer-motion'
import { User, Bell, Lock, Shield, CreditCard, Laptop } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'

const Settings = () => {
  const navigate = useNavigate()
  
  const sections = [
    { 
      icon: User, 
      label: 'Account Profile', 
      desc: 'Update your personal information, email, and avatar.',
      path: '/settings/profile'
    },
    { 
      icon: Bell, 
      label: 'Notifications', 
      desc: 'Manage how and when you receive reminders and alerts.',
      path: '/settings/notifications'
    },
    { 
      icon: Laptop, 
      label: 'Appearance', 
      desc: 'Customize your interface with Dark Mode and light themes.', 
      extra: <ThemeToggle /> 
    },
    { 
      icon: Lock, 
      label: 'Security', 
      desc: 'Update your password and manage two-factor authentication.',
      path: '/settings/security'
    },
    { 
      icon: CreditCard, 
      label: 'Billing & Plans', 
      desc: 'Manage your subscription and view payment history.',
      path: '/settings/billing'
    },
  ]

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-slate-500">Customize your experience and manage your account preferences.</p>
      </div>

      <div className="space-y-4">
        {sections.map((section, idx) => (
          <div 
            key={idx} 
            onClick={() => section.path && navigate(section.path)}
            className={`card p-6 flex items-center justify-between group transition-colors ${section.path ? 'cursor-pointer hover:border-primary-500/50' : ''}`}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-primary-500 transition-colors">
                <section.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">{section.label}</h3>
                <p className="text-sm text-slate-500">{section.desc}</p>
              </div>
            </div>
            {section.extra || (
              <button 
                className="btn btn-ghost text-sm"
                onClick={(e) => {
                  e.stopPropagation()
                  navigate(section.path)
                }}
              >
                Manage
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Settings;
