

import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Users, Target, Globe, Award } from 'lucide-react';

export default function AboutUs() {
  return (
    <div className="min-h-screen pt-28 pb-12 bg-[#050505]">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-10 border-neon-cyan/20"
        >
          <h1 className="text-4xl font-black font-display mb-6">About Us</h1>

          {/* Mission */}
          <div className="flex items-start gap-4 mb-8">
            <div className="p-3 bg-neon-cyan/10 rounded-xl">
              <Target className="text-neon-cyan" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Our Mission</h2>
              <p className="text-white/70">
                To redefine online shopping in Pakistan through immersive 3D experiences, 
                cutting‑edge AI, and a commitment to exceptional customer service.
              </p>
            </div>
          </div>

          {/* Who We Are */}
          <div className="flex items-start gap-4 mb-8">
            <div className="p-3 bg-neon-orange/10 rounded-xl">
              <Users className="text-neon-orange" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Who We Are</h2>
              <p className="text-white/70">
                Farhans Mart is a next‑generation e‑commerce platform based in Karachi, 
                Pakistan. We bring together fashion, health, and styling products under 
                one futuristic roof, powered by 3D visualization and AI recommendations.
              </p>
            </div>
          </div>

          {/* Global Reach */}
          <div className="flex items-start gap-4 mb-8">
            <div className="p-3 bg-neon-magenta/10 rounded-xl">
              <Globe className="text-neon-magenta" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Global Vision</h2>
              <p className="text-white/70">
                While rooted in Pakistan, we aim to deliver cutting‑edge technology 
                worldwide, making premium products accessible with a seamless digital 
                experience.
              </p>
            </div>
          </div>

          {/* Why Choose Us */}
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/10 rounded-xl">
              <Award className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Why Choose Us</h2>
              <ul className="list-disc list-inside space-y-2 text-white/70">
                <li>3D immersive product views</li>
                <li>AI‑powered recommendations</li>
                <li>Secure payments via JazzCash & EasyPaisa (coming soon)</li>
                <li>24/7 AI customer support</li>
                <li>Fast shipping across Pakistan</li>
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-white/10 text-center">
            <Link to="/" className="text-neon-cyan hover:underline">← Back to Home</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}