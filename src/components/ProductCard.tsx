import { motion } from 'motion/react';
import { ShoppingCart, Star, Plus, Scale } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Link } from 'react-router-dom';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  image: string;
  description: string;
  rating: number;
}

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;   // ← Fixed the error
}

export default function ProductCard({ product, onQuickView }: ProductCardProps) {
  const addToCart = useStore((state) => state.addToCart);
  const addToCompare = useStore((state) => state.addToCompare);
  const compareList = useStore((state) => state.compareList);
  const isComparing = compareList.some(p => p.id === product.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -10 }}
      className="glass-card p-4 group border-white/5 hover:border-neon-cyan/30 transition-all cursor-pointer"
    >
      <Link to={`/product/${product.id}`}>
        <div className="relative aspect-square overflow-hidden rounded-xl mb-4 bg-white/5">
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-black/50 backdrop-blur-md border border-white/10 text-[10px] font-bold uppercase tracking-widest text-neon-cyan">
            {product.category}
          </div>

          {product.discountPercentage && product.discountPercentage > 0 && (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute top-3 right-3 px-3 py-1 rounded-full bg-neon-magenta text-white text-[10px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(255,0,229,0.5)] z-10 animate-pulse"
            >
              {product.discountPercentage}% OFF
            </motion.div>
          )}
        </div>
      </Link>

      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-lg group-hover:text-neon-cyan transition-colors">{product.name}</h3>
        <div className="flex items-center gap-1 text-neon-orange">
          <Star size={12} fill="currentColor" />
          <span className="text-xs font-bold">{product.rating}</span>
        </div>
      </div>
      
      <p className="text-xs text-white/40 mb-4 line-clamp-2">{product.description}</p>
      
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-[10px] text-white/30 line-through font-bold">Rs. {product.originalPrice.toLocaleString()}</span>
          )}
          <span className="text-xl font-black font-display text-neon-cyan">Rs. {product.price.toLocaleString()}</span>
        </div>
        <span className="text-[10px] uppercase font-bold text-white/20 tracking-tighter">Karachi Express</span>
      </div>

      {/* Action buttons */}
      <div className="absolute bottom-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
        <button 
          onClick={(e) => { e.preventDefault(); addToCompare(product); }}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg ${
            isComparing ? 'bg-neon-magenta text-white' : 'bg-white/10 backdrop-blur-md text-white hover:bg-neon-magenta'
          }`}
        >
          <Scale size={18} />
        </button>
        <button 
          onClick={(e) => { e.preventDefault(); addToCart(product); }}
          className="w-10 h-10 rounded-full bg-neon-cyan text-black flex items-center justify-center shadow-[0_0_15px_#00D2FF]"
        >
          <Plus size={20} />
        </button>
      </div>
    </motion.div>
  );
}