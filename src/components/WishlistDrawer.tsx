import { X, Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../store/useStore';
import { Link } from 'react-router-dom';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WishlistDrawer({ isOpen, onClose }: WishlistDrawerProps) {
  const wishlist = useStore((state) => state.wishlist);
  const removeFromWishlist = useStore((state) => state.removeFromWishlist);
  const addToCart = useStore((state) => state.addToCart); // assuming you have this action

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-black/95 border-l border-neon-cyan/20 z-[101] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <Heart size={28} className="text-red-500" />
                <span className="text-2xl font-black tracking-tighter">WISHLIST</span>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6 space-y-4">
              {wishlist.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                  <Heart size={64} />
                  <p className="mt-6 text-lg font-bold">Your wishlist is empty</p>
                  <p className="text-sm text-white/50">Items you love will appear here</p>
                </div>
              ) : (
                wishlist.map((product) => (
                  <div
                    key={product.id}
                    className="glass-card p-4 flex gap-4 group"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded-xl border border-white/10"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm line-clamp-2 group-hover:text-neon-cyan transition-colors">
                        {product.name}
                      </div>
                      <div className="text-xs text-white/40 mt-1">{product.category}</div>
                      <div className="text-neon-orange font-black mt-2">
                        Rs. {product.price.toLocaleString()}
                      </div>

                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => {
                            addToCart(product);
                            removeFromWishlist(product.id);
                          }}
                          className="flex-1 flex items-center justify-center gap-2 bg-neon-orange text-black font-bold text-xs py-3 rounded-xl hover:scale-105 transition-all"
                        >
                          <ShoppingCart size={14} />
                          ADD TO CART
                        </button>
                        <button
                          onClick={() => removeFromWishlist(product.id)}
                          className="px-4 flex items-center justify-center border border-white/10 hover:border-red-500/50 hover:text-red-500 transition-colors rounded-xl"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {wishlist.length > 0 && (
              <div className="p-6 border-t border-white/10">
                <Link
                  to="/wishlist"
                  onClick={onClose}
                  className="block w-full text-center py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-bold uppercase tracking-widest text-sm transition-all"
                >
                  VIEW FULL WISHLIST
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}