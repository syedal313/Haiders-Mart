import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

export default function TermsOfService() {
  return (
    <div className="min-h-screen pt-28 pb-12 bg-[#050505]">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-10 border-neon-cyan/20"
        >
          <h1 className="text-4xl font-black font-display mb-8">Terms of Service</h1>
          <div className="space-y-6 text-white/70">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
              <p>By accessing or using Farhans Mart, you agree to be bound by these Terms of Service.</p>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Use of the Platform</h2>
              <p>You must be at least 18 years old to use our services. You are responsible for maintaining the confidentiality of your account.</p>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. Products and Pricing</h2>
              <p>All prices are in Pakistani Rupees (PKR). We reserve the right to change prices without notice.</p>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Shipping and Delivery</h2>
              <p>Orders are processed within 24 hours. Delivery times vary by location.</p>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Returns and Refunds</h2>
              <p>You may return items within 7 days of receipt for a full refund, provided they are unused and in original packaging.</p>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Privacy</h2>
              <p>Your use of the site is also governed by our Privacy Policy, which is incorporated by reference.</p>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Limitation of Liability</h2>
              <p>Farhans Mart is not liable for any indirect, incidental, or consequential damages arising from your use of the site.</p>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. Governing Law</h2>
              <p>These terms are governed by the laws of Pakistan.</p>
            </section>
          </div>
          <div className="mt-10 pt-6 border-t border-white/10">
            <Link to="/" className="text-neon-cyan hover:underline">← Back to Home</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}