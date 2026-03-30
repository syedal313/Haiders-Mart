import { motion } from 'motion/react';
import { Sparkles, X, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Announcement {
  text: string;
  isActive: boolean;
  link: string;
  color: string;
}

export default function AnnouncementBar() {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    fetch('/api/announcement')
      .then(res => res.json())
      .then(data => setAnnouncement(data))
      .catch(err => console.error('Failed to fetch announcement:', err));
  }, []);

  if (!announcement || !announcement.isActive || !isVisible) return null;

  const colorClasses = {
    cyan: 'bg-neon-cyan/20 border-neon-cyan/30 text-neon-cyan shadow-[0_0_20px_rgba(0,210,255,0.1)]',
    magenta: 'bg-neon-magenta/20 border-neon-magenta/30 text-neon-magenta shadow-[0_0_20px_rgba(255,0,229,0.1)]',
    orange: 'bg-neon-orange/20 border-neon-orange/30 text-neon-orange shadow-[0_0_20px_rgba(255,100,0,0.1)]',
  }[announcement.color as 'cyan' | 'magenta' | 'orange'] || 'bg-white/5 border-white/10 text-white';

  return (
    <motion.div 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`fixed top-0 left-0 right-0 z-[110] backdrop-blur-md border-b px-6 py-2 flex items-center justify-between gap-4 ${colorClasses}`}
    >
      <div className="flex-1 flex items-center justify-center gap-3">
        <Sparkles size={14} className="animate-pulse" />
        <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-center">
          {announcement.text}
        </p>
        <a 
          href={announcement.link} 
          className="flex items-center gap-1 text-[10px] font-bold underline underline-offset-2 hover:opacity-80 transition-opacity"
        >
          Details <ArrowRight size={10} />
        </a>
      </div>
      <button 
        onClick={() => setIsVisible(false)}
        className="p-1 hover:bg-white/10 rounded-full transition-colors"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}