import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingCart, Heart, Sparkles , Star} from 'lucide-react';
import { useStore } from '../store/useStore';
import { Product } from './ProductCard';
export default function ProductModal({ product, isOpen, onClose }: { product: Product | null; isOpen: boolean; onClose: () => void }) {
  const { addToCart, addToWishlist } = useStore();

  if (!product || !isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            className="max-w-4xl w-full glass-card p-8 relative">
            <button onClick={onClose} className="absolute top-6 right-6"><X size={28} /></button>

            <div className="grid md:grid-cols-2 gap-10">
              {/* Fake 3D Preview */}
              <div className="aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-neon-cyan/10 to-neon-magenta/10 flex items-center justify-center relative">
                <img src={product.image} className="w-4/5 h-4/5 object-cover rounded-2xl shadow-2xl" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Sparkles className="mx-auto text-neon-cyan animate-pulse" size={60} />
                    <p className="text-xs font-black tracking-widest mt-4 text-neon-cyan">3D IMMERSIVE VIEW</p>
                    <p className="text-[10px] text-white/40">Rotate with mouse (demo)</p>
                  </div>
                </div>
              </div>

              <div>
                <h1 className="text-4xl font-black">{product.name}</h1>
                <p className="text-neon-cyan font-bold uppercase text-sm mt-1">{product.category}</p>
                <div className="flex items-center gap-2 mt-6">
                  <Star size={20} fill="currentColor" className="text-neon-orange" />
                  <span className="text-2xl font-black">{product.rating}</span>
                </div>

                <p className="mt-8 text-white/70 leading-relaxed">{product.description}</p>

                <div className="mt-10 flex items-end gap-6">
                  <div>
                    <span className="text-xs text-white/40">Price</span>
                    <p className="text-5xl font-black text-neon-cyan">Rs. {product.price.toLocaleString()}</p>
                  </div>
                  {product.originalPrice && <span className="line-through text-white/30">Rs. {product.originalPrice.toLocaleString()}</span>}
                </div>

                <div className="mt-10 flex gap-4">
                  <button onClick={() => { addToCart(product); onClose(); }} className="flex-1 neon-button-orange flex items-center justify-center gap-3">
                    <ShoppingCart /> Add to Cart
                  </button>
                  <button onClick={() => addToWishlist(product)} className="px-8 py-3 rounded-full border border-white/20 hover:bg-white/5">
                    <Heart size={24} />
                  </button>
                </div>

                <div className="mt-8 text-xs text-white/40 flex items-center gap-2">
                  <Sparkles size={14} /> AI Stylist says: "Perfect for cyber-night outings"
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}