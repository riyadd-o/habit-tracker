import Modal from './Modal'

const TermsModal = ({ isOpen, onClose }) => {
  
  const sections = [
    {
      title: 'Agreement to Terms',
      content: 'By accessing or using HabitFlow, you agree to be bound by these Terms of Service. If you do not agree, you may not use the service.'
    },
    {
      title: 'Your Account',
      content: 'You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.'
    },
    {
      title: 'Usage Rules',
      content: 'HabitFlow is designed for personal habit tracking. You agree not to use the service for any illegal purposes or to interfere with the performance of our servers.'
    },
    {
      title: 'Privacy & Data',
      content: 'Your privacy is paramount. We handle your data according to our Privacy Policy. We do not sell your personal information to third parties.'
    },
    {
      title: 'Termination',
      content: 'We reserve the right to suspend or terminate your account at our discretion if we believe you have violated these terms.'
    }
  ]

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Terms of Service"
      maxWidth="650px"
      footer={
        <button 
          onClick={onClose} 
          className="btn btn-primary w-full h-14 font-black text-lg shadow-xl shadow-primary-500/20 active:scale-[0.98] transition-all"
        >
          I Accept & Understand
        </button>
      }
    >
      <div className="space-y-8">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest -mt-4 mb-4 px-1">Effective Date: April 23, 2026</p>
        
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
          Please note that HabitFlow is a productivity tool and does not provide medical or psychological advice. Always consult a professional for health-related decisions.
        </div>
      </div>
    </Modal>
  )
}

export default TermsModal
