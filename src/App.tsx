import { useEffect, useState, useMemo } from 'react';
import { Analytics } from "@vercel/analytics/next"
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import CartDrawer from './components/CartDrawer';
import WishlistDrawer from './components/WishlistDrawer';
import Hero from './components/Hero';
import ThreeBackground from './components/ThreeBackground';
import ProductCard from './components/ProductCard';
import ProductSkeleton from './components/ProductSkeleton';
import SidebarFilters from './components/SidebarFilters';
import AnnouncementBar from './components/AnnouncementBar';
import LoginPage from './pages/LoginPage';
import AdminPortal from './pages/AdminPortal';
import { useStore } from './store/useStore';
import { CreditCard, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Filter, ChevronDown, SlidersHorizontal, CheckCircle2, ShoppingBag, ArrowRight, X, Sparkles, Star } from 'lucide-react';
import ProductDetail from './components/ProductDetail';
import ProductModal from './components/ProductModal';
import { useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { SpeedInsights } from "@vercel/speed-insights/react"
import logo from './components/public/logo1.png';

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

interface Filters {
  categories: string[];
  priceRange: [number, number];
  minRating: number;
}

type SortOption = 'price-low' | 'price-high' | 'name-az' | 'name-za' | 'popularity';

function HomePage() {
  // Inside HomePage component (in App.tsx)


  const [products, setProducts] = useState<Product[]>([]);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('popularity');
  const [filters, setFilters] = useState<Filters>({
    categories: [],
    priceRange: [0, 10000],
    minRating: 0
  });
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
        const max = Math.max(...data.map((p: Product) => p.price));
        setFilters(prev => ({ ...prev, priceRange: [0, max] }));

        // Simulate AI recommendations
        const shuffled = [...data].sort(() => 0.5 - Math.random());
        setRecommendations(shuffled.slice(0, 4));
      })
      .catch(err => console.error('Failed to fetch products:', err));
  }, []);

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];
    if (filters.categories.length > 0) {
      result = result.filter(p => filters.categories.includes(p.category));
    }
    result = result.filter(p => p.price <= filters.priceRange[1]);
    result = result.filter(p => p.rating >= filters.minRating);
    result.sort((a, b) => {
      switch (sortBy) {
        case 'price-low': return a.price - b.price;
        case 'price-high': return b.price - a.price;
        case 'name-az': return a.name.localeCompare(b.name);
        case 'name-za': return b.name.localeCompare(a.name);
        case 'popularity': return b.rating - a.rating;
        default: return 0;
      }
    });
    return result;
  }, [products, filters, sortBy]);

  const maxPrice = products.length > 0 ? Math.max(...products.map(p => p.price)) : 10000;
  // Helper to remove a category from active filters
  const removeCategory = (cat: string) => {
    setFilters({
      ...filters,
      categories: filters.categories.filter((c) => c !== cat),
    });
  };
  const handleQuickView = (product: Product) => {
    setQuickViewProduct(product);
  };

  const closeQuickView = () => {
    setQuickViewProduct(null);
  };
  // Helper to remove a rating filter
  const removeRatingFilter = () => {
    setFilters({
      ...filters,
      minRating: 0
    });
  };
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  useEffect(() => {
    if (categoryParam) {
      setFilters(prev => ({ ...prev, categories: [categoryParam] }));
    }
  }, [categoryParam]);
  const [email, setEmail] = useState('');
  const handleSubscribe = async () => {
    if (!email) return;
    try {
      const res = await fetch('/api/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      if (res.ok) alert('Subscribed successfully!'); else alert('Subscription failed.');
    } catch (err) { console.error(err); }
  };
  return (
    <>
      <Hero />
      <section id="catalog" className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex flex-col lg:flex-row gap-12">

          {/* STATIC SIDEBAR - DESKTOP */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            {/* STATIC SIDEBAR - DESKTOP */}
            <SidebarFilters
              filters={filters}
              setFilters={setFilters}
              maxPrice={maxPrice}
              variant="static" isOpen={false} onClose={function (): void {
                throw new Error('Function not implemented.');
              }} />
          </aside>

          {/* MAIN PRODUCT AREA */}
          <div className="flex-1">

            {/* Catalog Header + Sort */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div>
                <h2 className="text-4xl md:text-5xl font-black font-display mb-2 uppercase tracking-tighter">
                  The <span className="text-neon-magenta">Catalog</span>
                </h2>
                <p className="text-white/40 text-sm">
                  Showing {filteredAndSortedProducts.length} results from the Haiders Node
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                {/* Sort Options */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0">
                  {[
                    { id: 'popularity', label: 'Popularity' },
                    { id: 'price-low', label: 'Price: Low-High' },
                    { id: 'price-high', label: 'Price: High-Low' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setSortBy(opt.id as SortOption)}
                      className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${sortBy === opt.id
                          ? 'bg-neon-cyan text-black shadow-[0_0_15px_rgba(0,210,255,0.5)]'
                          : 'text-white/40 hover:text-white'
                        }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="lg:hidden flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest hover:border-neon-cyan hover:bg-neon-cyan/10 transition-all group"
                >
                  <Filter size={16} className="group-hover:text-neon-cyan" />
                  Filters
                </button>
              </div>
            </div>

            {/* Active Filter Chips */}
            {(filters.categories.length > 0 || filters.minRating > 0) && (
              <div className="flex flex-wrap gap-2 mb-8">
                {filters.categories.map((cat) => (
                  <div
                    key={cat}
                    className="px-4 py-1 bg-white/10 hover:bg-white/20 rounded-full text-xs font-bold flex items-center gap-2 transition-colors"
                  >
                    {cat}
                    <button
                      onClick={() => removeCategory(cat)}
                      className="text-white/40 hover:text-white text-lg leading-none"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {filters.minRating > 0 && (
                  <div className="px-4 py-1 bg-white/10 hover:bg-white/20 rounded-full text-xs font-bold flex items-center gap-2 transition-colors">
                    {filters.minRating}+ Stars
                    <button
                      onClick={() => setFilters({ ...filters, minRating: 0 })}
                      className="text-white/40 hover:text-white text-lg leading-none"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* PRODUCT GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => <ProductSkeleton key={i} />)
              ) : (
                <AnimatePresence mode="popLayout">
                  {filteredAndSortedProducts.map((product) => (
                    <motion.div
                      key={product.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ProductCard product={product} onQuickView={handleQuickView} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Empty State */}
            {!loading && filteredAndSortedProducts.length === 0 && (
              <div className="py-24 text-center glass-card border-dashed border-white/10">
                <p className="text-white/30 uppercase tracking-widest font-bold">
                  No products match your current filters
                </p>
                <button
                  onClick={() => setFilters({ categories: [], priceRange: [0, maxPrice], minRating: 0 })}
                  className="mt-4 text-neon-cyan text-xs font-bold uppercase underline underline-offset-4"
                >
                  Clear all filters
                </button>
              </div>
            )}
            {/* AI Recommendations */}
            {!loading && recommendations.length > 0 && (
              <div className="mt-32">
                <div className="flex items-center gap-4 mb-12">
                  <div className="w-12 h-12 rounded-2xl bg-neon-magenta/20 flex items-center justify-center text-neon-magenta shadow-[0_0_20px_rgba(255,0,229,0.2)]">
                    <Sparkles size={24} />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black font-display uppercase tracking-tighter">
                      AI <span className="text-neon-magenta">Recommendations</span>
                    </h3>
                    <p className="text-white/40 text-xs font-bold uppercase tracking-widest">
                      Personalized for your current session
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {recommendations.map((product) => (
                    <motion.div
                      key={`rec-${product.id}`}
                      whileHover={{ y: -10 }}
                      className="glass-card p-4 border-white/5 hover:border-neon-magenta/30 transition-all group"
                    >
                      <div className="relative aspect-square rounded-xl overflow-hidden mb-4 bg-white/5">
                        <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute top-2 right-2 px-2 py-1 rounded bg-neon-magenta/20 backdrop-blur-md border border-neon-magenta/30 text-[8px] font-bold uppercase tracking-widest text-neon-magenta">
                          AI Pick
                        </div>
                      </div>
                      <h4 className="font-bold text-sm mb-1 uppercase tracking-tight">{product.name}</h4>
                      <div className="flex justify-between items-center">
                        <span className="text-neon-magenta font-black text-sm">Rs. {product.price.toLocaleString()}</span>
                        <div className="flex items-center gap-1 text-neon-orange">
                          <Star size={10} fill="currentColor" />
                          <span className="text-[10px] font-bold">{product.rating}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* MOBILE FILTER DRAWER */}
      <SidebarFilters
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        filters={filters}
        setFilters={setFilters}
        maxPrice={maxPrice}
        variant="drawer"
      />

    </>
  );
}

function CheckoutModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { cart, total, clearCart } = useStore();
  const [step, setStep] = useState(1);
  const [customer, setCustomer] = useState({
    name: '',
    email: '', address: '', city: 'Karachi'
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState('');

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart, total, customer }),
      });
      const data = await res.json();
      if (res.ok) {
        setOrderId(data.id);
        setStep(3);
        clearCart();
      }
    } catch (err) {
      console.error('Checkout failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
          <motion.div
  initial={{ scale: 0.9, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  exit={{ scale: 0.9, opacity: 0 }}
  className="relative w-full max-w-xl glass-card p-10 border-neon-cyan/30 max-h-[90vh] overflow-y-auto"
>
            <button onClick={onClose} className="absolute top-6 right-6 text-white/30 hover:text-white"><X size={24} /></button>

            {step === 1 && (
              <div className="space-y-8">
                <h3 className="text-3xl font-black font-display uppercase tracking-tighter">Review <span className="text-neon-cyan">Order</span></h3>
                <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                  {cart.map(item => (
                    <div key={item.id} className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/5">
                      <div className="flex items-center gap-4">
                        <img src={item.image} className="w-12 h-12 rounded-lg object-cover" />
                        <div>
                          <div className="text-xs font-bold">{item.name}</div>
                          <div className="text-[10px] text-white/40 uppercase font-bold">Qty: {item.quantity}</div>
                        </div>
                      </div>
                      <div className="text-xs font-black text-neon-cyan">Rs. {(item.price * item.quantity).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-6 border-t border-white/10">
                  <span className="text-white/50 font-bold uppercase tracking-widest text-xs">Total Credits</span>
                  <span className="text-3xl font-black font-display">Rs. {total.toLocaleString()}</span>
                </div>
                <button onClick={() => setStep(2)} className="w-full neon-button-orange flex items-center justify-center gap-3">
                  Proceed to Logistics
                  <ArrowRight size={20} />
                </button>
              </div>
            )}

            {step === 2 && (
              <form onSubmit={handleCheckout} className="space-y-6">
                <h3 className="text-3xl font-black font-display uppercase tracking-tighter">Delivery <span className="text-neon-magenta">Node</span></h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-4">Full Name</label>
                    <input type="text" required value={customer.name} onChange={e => setCustomer({ ...customer, name: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-full px-6 py-3 focus:outline-none focus:border-neon-cyan transition-all text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-4">Email Address</label>
                    <input type="email" required value={customer.email} onChange={e => setCustomer({ ...customer, email: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-full px-6 py-3 focus:outline-none focus:border-neon-cyan transition-all text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-4">City</label>
                      <select value={customer.city} onChange={e => setCustomer({ ...customer, city: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-full px-6 py-3 focus:outline-none focus:border-neon-cyan transition-all text-sm appearance-none">
                        <option value="Karachi">Karachi</option>
                        <option value="Lahore">Lahore</option>
                        <option value="Islamabad">Islamabad</option>
                        <option value="Faisalabad">Faisalabad</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-4">Payment</label>
                      <div className="w-full bg-white/10 border border-neon-cyan/30 rounded-full px-6 py-3 text-xs font-bold text-neon-cyan flex items-center gap-2">
                        <ShoppingBag size={14} />
                        Cash on Delivery
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-4">Shipping Address</label>
                    <textarea required value={customer.address} onChange={e => setCustomer({ ...customer, address: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-3 focus:outline-none focus:border-neon-cyan transition-all text-sm h-24 resize-none" />
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setStep(1)} className="flex-1 px-8 py-3 rounded-full border border-white/10 font-bold uppercase tracking-widest hover:bg-white/5 transition-colors">Back</button>
                  <button type="submit" disabled={isProcessing} className="flex-1 neon-button-orange">{isProcessing ? "TRANSMITTING..." : "CONFIRM ORDER"}</button>
                </div>
              </form>
            )}

            {step === 3 && (
              <div className="text-center py-12 space-y-8">
                <div className="w-24 h-24 bg-neon-cyan/20 rounded-full flex items-center justify-center mx-auto text-neon-cyan shadow-[0_0_40px_rgba(0,210,255,0.2)]">
                  <CheckCircle2 size={48} />
                </div>
                <div>
                  <h3 className="text-4xl font-black font-display uppercase tracking-tighter mb-2">Order <span className="text-neon-cyan">Secured</span></h3>
                  <p className="text-white/40 font-mono text-sm">TRANSMISSION ID: {orderId}</p>
                </div>
                <p className="text-white/60 leading-relaxed max-w-sm mx-auto">
                  Your order has been successfully logged at the Karachi Node.
                  Expect delivery within 48-72 standard hours.
                </p>
                <button onClick={onClose} className="neon-button-orange">Return to Hub</button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default function App() {
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);

  const [user, setUser] = useState<any>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  // 👇 Add these lines
  const [email, setEmail] = useState('');
  const handleSubscribe = async () => {
    if (!email) return;
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (res.ok) alert('Subscribed successfully!');
      else alert('Subscription failed.');
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) setUser(data.user);
      })
      .catch(() => setUser(null));
  }, []);

  return (
    <Router>
      <main className="relative min-h-screen pt-28">           <AnnouncementBar />
        <ThreeBackground />
        <Navbar onCheckout={() => setIsCheckoutOpen(true)} user={user} />


        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
          <Route path="/admin" element={<AdminPortal />} />
          <Route path="/product/:id" element={<ProductDetail />} />   {/* ← NEW */}
        </Routes>
        <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />

        <section className="max-w-7xl mx-auto px-6 py-24">
          <div className="glass-card p-12 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-neon-orange/20 via-neon-magenta/20 to-neon-cyan/20 opacity-50 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 flex flex-col items-center text-center">
              <h2 className="text-5xl md:text-7xl font-black font-display mb-6 uppercase">
                JOIN THE <span className="text-neon-cyan">REVOLUTION</span>
              </h2>
              <p className="text-xl text-white/70 mb-10 max-w-2xl">
                Get early access to limited edition NFT-verified drops and
                exclusive styling sessions with our AI advisor.
              </p>
              <div className="flex w-full max-w-md gap-2">
                <input
                  type="email"
                  placeholder="ENTER YOUR COMMS ID"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-full px-6 py-4 focus:outline-none focus:border-neon-cyan transition-colors font-mono text-sm"
                />
                <button onClick={handleSubscribe} className="neon-button-orange whitespace-nowrap">
                  Initialize
                </button>

              </div>
            </div>
          </div>
        </section>

        <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
              <img src={logo} alt="Haiders Mart" className="h-15 w-auto" />
          </div>


          <div className="flex gap-8 text-[10px] uppercase font-bold tracking-widest text-white/30">
            <a href="#" className="hover:text-white transition-colors">Privacy Protocol</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Shipping Nodes</a>
            <a href="#" className="hover:text-white transition-colors">Contact Core</a>
          </div>

          <div className="text-[10px] text-white/20 font-mono">
            © 2026 HAIDERS MART // KARACHI_NODE_01
          </div>
        </footer>
        <SpeedInsights/>
      </main>
    </Router>
  );
}
