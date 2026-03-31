import { ShoppingCart, Search, User, Menu, Mic, X, LogOut, LayoutDashboard, Scale, Star, Plus, Heart } from 'lucide-react';import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, useRef } from 'react';
import VoiceSearch from './VoiceSearch';
import CartDrawer from './CartDrawer';
import logo from './public/logo1.png';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';


import { Link} from 'react-router-dom';
import WishlistDrawer from './WishlistDrawer';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
  rating: number;
}

interface NavbarProps {
  onCheckout: () => void;
  user: any;
}

export default function Navbar({ onCheckout, user }: NavbarProps) {
  const cart = useStore((state) => state.cart);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const compareList = useStore((state) => state.compareList);
  const removeFromCompare = useStore((state) => state.removeFromCompare);
  
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
const { theme, toggleTheme } = useTheme();
 useEffect(() => {
  const delayDebounceFn = setTimeout(() => {
    if (searchQuery.trim().length > 1) {
      fetch(`/api/products?q=${searchQuery}`) // Better to filter on server
        .then(res => res.ok ? res.json() : [])
        .then((data) => {
          const filtered = data.filter((p: Product) => 
            p.name.toLowerCase().includes(searchQuery.toLowerCase())
          ).slice(0, 5);
          setSearchResults(filtered);
        })
        .catch(() => setSearchResults([]));
    }
  }, 300); // Wait 300ms

  return () => clearTimeout(delayDebounceFn);
}, [searchQuery]);

  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
    const wishlist = useStore((state) => state.wishlist);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.reload();
  };
  return (
    <>
      <nav className="fixed top-6 left-0 right-0 z-50 px-6 py-4" >
        <div className="max-w-7xl mx-auto glass-card px-8 py-4 flex items-center justify-between border-neon-cyan/20">
        <Link to="/" className="flex items-center gap-2 group">
  <img 
    src={logo}
    alt="Haiders Mart" 
    className="h-20 w-auto" 
  />
  {/* <span className="text-2xl font-black tracking-tighter font-display hidden sm:block">
    Haiders <span className="text-neon-cyan">MART</span>
  </span> */}
</Link>

          <div className="hidden lg:flex flex-1 max-w-md mx-8 relative" ref={searchRef}>
            <div className="relative w-full">
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                placeholder="Search the future..."
                className="w-full bg-white/5 border border-white/10 rounded-full px-12 py-2 text-sm focus:outline-none focus:border-neon-cyan transition-all font-medium"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
              <button 
                onClick={() => setIsVoiceOpen(true)}
                className="absolute right-12 top-1/2 -translate-y-1/2 text-white/30 hover:text-neon-cyan transition-colors"
              >
                <Mic size={16} />
              </button>
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <AnimatePresence>
              {isSearchFocused && searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full left-0 right-0 mt-2 glass-card p-2 border-neon-cyan/30 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                >
                  {searchResults.map(product => (
                    <div 
                      key={product.id}
                      className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg cursor-pointer transition-colors group"
                    >
                      <img src={product.image} alt={product.name} className="w-12 h-12 rounded-lg object-cover border border-white/10" />
                      <div className="flex-1">
                        <div className="text-xs font-bold group-hover:text-neon-cyan transition-colors">{product.name}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="text-[10px] text-white/40 uppercase">{product.category}</div>
                          <div className="w-1 h-1 rounded-full bg-white/20" />
                          <div className="flex items-center gap-1 text-neon-orange text-[10px] font-bold">
                            <Star size={8} fill="currentColor" />
                            {product.rating}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs font-black text-neon-orange">Rs. {product.price.toLocaleString()}</div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            <button
  onClick={toggleTheme}
  className="p-2 hover:bg-white/5 rounded-full transition-colors"
>
  {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
</button>
            <button 
              onClick={() => setIsCompareOpen(true)}
              className="relative p-2 hover:bg-white/5 rounded-full transition-colors group hidden sm:block"
            >
              <Scale size={20} className="group-hover:text-neon-magenta transition-colors" />
              {compareList.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-neon-magenta rounded-full text-[8px] font-black flex items-center justify-center shadow-[0_0_10px_rgba(255,0,229,0.5)]">
                  {compareList.length}
                </span>
              )}
            </button>
            <button 
              onClick={() => setIsWishlistOpen(true)}
              className="relative p-2 hover:bg-white/5 rounded-full transition-colors group hidden sm:block"
            >
              <Heart size={20} className="group-hover:text-red-500 transition-colors" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-black flex items-center justify-center shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                  {wishlist.length}
                </span>
              )}
            </button>

            <div className="relative">
              <ShoppingCart 
                size={20} 
                className="hover:text-neon-orange transition-colors cursor-pointer" 
                onClick={() => setIsCartOpen(true)}
              />
              {cartCount > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 bg-neon-orange text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center pointer-events-none shadow-[0_0_10px_rgba(255,78,0,0.5)]"
                >
                  {cartCount}
                </motion.span>
              )}
            </div>

            <div className="relative hidden md:block">
              <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="p-2 hover:bg-white/5 rounded-full transition-colors group">
                <User size={20} className={user ? "text-neon-cyan" : "group-hover:text-neon-cyan"} />
              </button>
              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute top-full right-0 mt-2 w-48 glass-card border-white/10 overflow-hidden">
                    {user ? (
                      <>
                        <div className="px-4 py-3 border-b border-white/5">
                          <div className="text-[10px] font-bold uppercase text-white/40">Logged in as</div>
                          <div className="text-xs font-black truncate">{user.name}</div>
                        </div>
                        {user.role === 'admin' && (
                          <Link to="/admin" className="flex items-center gap-3 px-4 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-colors">
                            <LayoutDashboard size={14} /> Admin Portal
                          </Link>
                        )}
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-colors text-neon-magenta">
                          <LogOut size={14} /> Logout
                        </button>
                      </>
                    ) : (
                      <Link to="/login" className="flex items-center gap-3 px-4 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-colors">
                        <User size={14} /> Login / Register
                      </Link>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button className="md:hidden p-2 hover:bg-white/5 rounded-full transition-colors" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>    

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100]"
            />
            <motion.div 
              initial={{ x: '100%' }} 
              animate={{ x: 0 }} 
              exit={{ x: '100%' }} 
              className="fixed top-0 right-0 bottom-0 w-full max-w-xs bg-black/90 border-l border-white/10 z-[101] p-8 flex flex-col"
            >
              <div className="flex justify-between items-center mb-12">
              <div className="flex items-center gap-2">
  <img src={logo} alt="Haiders Mart" className="h-15 w-auto" />
</div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-8 flex-1">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="SEARCH_NODE..." 
                    className="w-full bg-white/5 border border-white/10 rounded-full px-6 py-3 text-xs focus:outline-none focus:border-neon-cyan transition-all"
                  />
                  <Search size={16} className="absolute right-6 top-1/2 -translate-y-1/2 text-white/30" />
                </div>

              <div className="space-y-4">
  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 ml-2">Navigation</p>
  <Link to="/?category=Garments" onClick={() => setIsMobileMenuOpen(false)} className="block text-2xl font-black font-display uppercase tracking-tighter hover:text-neon-cyan transition-colors">
    Garments
  </Link>
  <Link to="/?category=Pharmacy" onClick={() => setIsMobileMenuOpen(false)} className="block text-2xl font-black font-display uppercase tracking-tighter hover:text-neon-cyan transition-colors">
    Pharmacy
  </Link>
  <Link to="/?category=Skincare" onClick={() => setIsMobileMenuOpen(false)} className="block text-2xl font-black font-display uppercase tracking-tighter hover:text-neon-cyan transition-colors">
    Skincare
  </Link>
</div>

                <div className="space-y-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 ml-2">Account</p>
                  {user ? (
                    <>
                      <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5">
                        <div className="w-10 h-10 rounded-full bg-neon-cyan/20 flex items-center justify-center text-neon-cyan">
                          <User size={20} />
                        </div>
                        <div>
                          <div className="text-xs font-black">{user.name}</div>
                          <div className="text-[10px] text-white/40 uppercase">{user.role}</div>
                        </div>
                      </div>
                      {user.role === 'admin' && (
                        <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest hover:text-neon-cyan transition-colors">
                          <LayoutDashboard size={18} /> Admin Portal
                        </Link>
                      )}
                      <button onClick={handleLogout} className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-neon-magenta hover:opacity-80 transition-opacity">
                        <LogOut size={18} /> Logout Session
                      </button>
                    </>
                  ) : (
                    <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest hover:text-neon-cyan transition-colors">
                      <User size={18} /> Login to Node
                    </Link>
                  )}
                </div>
              </div>

              <div className="pt-8 border-t border-white/5 text-center">
                <p className="text-[10px] text-white/20 font-mono uppercase tracking-widest">Karachi_Node_01 // v2.5.0</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Comparison Modal */}
      <AnimatePresence>
        {isCompareOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCompareOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-5xl glass-card p-10 border-neon-magenta/30">
              <button onClick={() => setIsCompareOpen(false)} className="absolute top-6 right-6 text-white/30 hover:text-white"><X size={24} /></button>
              
              <h3 className="text-4xl font-black font-display uppercase tracking-tighter mb-12">Product <span className="text-neon-magenta">Comparison</span></h3>
              
              {compareList.length === 0 ? (
                <div className="py-24 text-center opacity-30">
                  <Scale size={64} className="mx-auto mb-6" />
                  <p className="font-bold uppercase tracking-widest">No products selected for comparison</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {compareList.map(product => (
                    <div key={product.id} className="space-y-6">
                      <div className="relative aspect-square rounded-2xl overflow-hidden border border-white/10">
                        <img src={product.image} className="w-full h-full object-cover" />
                        <button 
                          onClick={() => removeFromCompare(product.id)}
                          className="absolute top-3 right-3 p-2 bg-black/50 backdrop-blur-md rounded-full text-white/50 hover:text-neon-magenta transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <div>
                        <h4 className="text-xl font-bold uppercase tracking-tight mb-1">{product.name}</h4>
                        <p className="text-[10px] text-neon-cyan font-bold uppercase tracking-widest">{product.category}</p>
                      </div>
                      <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                          <p className="text-[10px] text-white/40 uppercase font-bold mb-1">Price</p>
                          <p className="text-xl font-black">Rs. {product.price.toLocaleString()}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                          <p className="text-[10px] text-white/40 uppercase font-bold mb-1">Rating</p>
                          <div className="flex items-center gap-2">
                            <Star size={14} className="text-neon-orange" fill="currentColor" />
                            <p className="text-lg font-bold">{product.rating} / 5.0</p>
                          </div>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                          <p className="text-[10px] text-white/40 uppercase font-bold mb-1">Description</p>
                          <p className="text-xs text-white/60 leading-relaxed">{product.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {compareList.length < 3 && (
                    <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-white/10 rounded-2xl opacity-30">
                      <Plus size={32} className="mb-4" />
                      <p className="text-xs font-bold uppercase tracking-widest">Add more to compare</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
            
          </div>
        )}
      </AnimatePresence>

      <VoiceSearch isOpen={isVoiceOpen} onClose={() => setIsVoiceOpen(false)} />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} onCheckout={onCheckout} />
      <WishlistDrawer 
        isOpen={isWishlistOpen} 
        onClose={() => setIsWishlistOpen(false)} 
      />
      
    </>
  );
}
