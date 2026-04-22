import Modal from './Modal'

const TermsModal = ({ isOpen, onClose }) => {
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
          I Understand
        </button>
      }
    >
      <div className="space-y-8">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest -mt-4 mb-4 px-1">Effective April 2026</p>
        
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
    </Modal>
  )
}

export default TermsModal
