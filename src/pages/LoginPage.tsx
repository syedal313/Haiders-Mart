import { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      // Refresh page or redirect
      window.location.href = data.user.role === 'admin' ? '/admin' : '/';
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-card p-10 border-neon-cyan/20"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-neon-orange rounded-2xl flex items-center justify-center font-black text-3xl italic mx-auto mb-6 shadow-[0_0_20px_#FF4E00]">H</div>
          <h1 className="text-3xl font-black font-display uppercase tracking-tighter">
            ACCESS <span className="text-neon-cyan">CORE</span>
          </h1>
          <p className="text-white/40 text-xs mt-2 uppercase tracking-widest">Secure Node Authentication</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold uppercase tracking-widest text-center">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-4">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@haidersmart.pk"
                className="w-full bg-white/5 border border-white/10 rounded-full px-12 py-4 focus:outline-none focus:border-neon-cyan transition-all text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-4">Access Key</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-full px-12 py-4 focus:outline-none focus:border-neon-magenta transition-all text-sm"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full neon-button-orange flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? "INITIALIZING..." : "ENTER SYSTEM"}
            <ArrowRight size={20} />
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-white/5 flex items-center justify-center gap-2 text-[10px] text-white/20 uppercase tracking-widest font-bold">
          <ShieldCheck size={14} />
          End-to-End Encrypted Node
        </div>
      </motion.div>
    </div>
  );
}