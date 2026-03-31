import { motion } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-neon-cyan text-xs font-bold uppercase tracking-widest mb-6">
            <Sparkles size={14} />
            The Future of Retail is Here
          </div>
          <h1 className="text-6xl md:text-8xl font-black font-display leading-tight mb-6">
            UPGRADE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-orange via-neon-magenta to-neon-cyan">
              YOUR REALITY
            </span>
          </h1>
          <p className="text-lg text-white/60 max-w-lg mb-10 leading-relaxed">
            Experience Pakistan's first 3D-immersive e-commerce platform.
            Garments, Pharmacy, and Styling curated for the next generation.
          </p>
          <div className="flex flex-wrap gap-4">
  <button 
    onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })}
    className="neon-button-orange flex items-center gap-2 group"
  >
    Shop Now <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
  </button>
  <Link to="/product/1" className="px-8 py-3 rounded-full border border-white/20 font-bold uppercase tracking-widest hover:bg-white/5 transition-colors">
    View 3D Catalog
  </Link>
</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative hidden lg:block"
        >
          <div className="relative z-10 w-full aspect-square glass-card p-8 neon-border-cyan flex items-center justify-center overflow-hidden group">
            <img
              src="https://picsum.photos/seed/futuristic-fashion/1000/1000"
              alt="Futuristic Model"
              className="w-full h-full object-cover rounded-xl grayscale group-hover:grayscale-0 transition-all duration-700 scale-110 group-hover:scale-100"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neon-cyan/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          {/* Floating elements */}
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-10 -right-10 w-32 h-32 glass-card p-4 flex flex-col items-center justify-center text-center"
          >
            <span className="text-neon-orange font-black text-xl">40%</span>
            <span className="text-[10px] uppercase font-bold text-white/50">Flash Sale</span>
          </motion.div>

          <motion.div
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -bottom-10 -left-10 w-40 h-20 glass-card p-4 flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-full bg-neon-cyan/20 flex items-center justify-center">
              <Sparkles size={20} className="text-neon-cyan" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-white/50">New Arrival</div>
              <div className="text-xs font-bold">Cyber-Knit V2</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
