import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, CreditCard } from 'lucide-react';
import { useStore } from '../store/useStore';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export default function CartDrawer({ isOpen, onClose, onCheckout }: CartDrawerProps) {
  const { cart, total, removeFromCart } = useStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md z-[70] glass-card rounded-none border-l border-white/10 p-8 flex flex-col"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black font-display uppercase tracking-tighter">
                Your <span className="text-neon-orange">Cart</span>
              </h2>
              <button onClick={onClose} className="text-white/50 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 pr-2">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                  <div className="w-20 h-20 rounded-full border-2 border-dashed border-white/20 mb-4 flex items-center justify-center">
                    <Trash2 size={32} />
                  </div>
                  <p className="font-bold uppercase tracking-widest text-xs">Cart is empty</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/5 group">
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h3 className="font-bold text-sm">{item.name}</h3>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-white/20 hover:text-neon-orange transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="text-[10px] text-white/40 uppercase font-bold mb-2">{item.category}</div>
                      <div className="flex justify-between items-end">
                        <div className="text-xs font-bold text-white/60">Qty: {item.quantity}</div>
                        <div className="font-black text-neon-cyan">Rs. {(item.price * item.quantity).toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="mt-8 pt-8 border-t border-white/10">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-white/50 font-bold uppercase tracking-widest text-xs">Total Credits</span>
                  <span className="text-3xl font-black font-display">Rs. {total.toLocaleString()}</span>
                </div>
                <button onClick={onCheckout} className="w-full neon-button-orange flex items-center justify-center gap-3">
                  <CreditCard size={20} />
                  Initialize Checkout
                </button>
                <p className="text-[10px] text-center mt-4 text-white/20 uppercase tracking-widest">
                  Secure Transaction via Haiders Pay Node
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}