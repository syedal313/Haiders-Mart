import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  Plus, 
  Trash2, 
  Edit3, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  LogOut,
  ArrowRight,
  LogIn,
  ShieldCheck,
  Megaphone,
  Percent,
  Activity
} from 'lucide-react';
import { signInWithGoogle } from '../firebase';

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

interface Order {
  id: string;
  items: any[];
  total: number;
  customer: any;
  status: string;
  createdAt: string;
  node: string;
}


const ADMIN_EMAIL = '1shahali121@gmail.com';

export default function AdminPortal() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'marketing'>('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [announcement, setAnnouncement] = useState({ text: '', isActive: true, link: '', color: 'cyan' });
  const [loading, setLoading] = useState(true);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDeletingProduct, setIsDeletingProduct] = useState<string | null>(null);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Garments',
    price: 0,
    originalPrice: 0,
    discountPercentage: 0,
    image: '',
    description: ''
  });

  useEffect(() => {
    // Check if already logged in via traditional auth
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user && data.user.role === 'admin') {
          setAdminUser(data.user);
          // If it's an admin, fetchData will handle setting loading to false
        } else {
          setLoading(false);
        }
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (adminUser) {
      fetchData();
    }
  }, [adminUser]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, orderRes, annRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/admin/orders'),
        fetch('/api/announcement')
      ]);
      
      const prodData = await prodRes.json();
      const orderData = await orderRes.json();
      const annData = await annRes.json();
      
      if (Array.isArray(prodData)) setProducts(prodData);
      if (Array.isArray(orderData)) setOrders(orderData);
      if (annData) setAnnouncement(annData);
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/announcement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(announcement),
      });
      if (res.ok) {
        alert('Announcement updated successfully!');
      }
    } catch (err) {
      console.error('Failed to update announcement:', err);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct),
      });
      if (res.ok) {
        setIsAddingProduct(false);
        fetchData();
      }
    } catch (err) {
      console.error('Failed to add product:', err);
    }
  };
const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("image", file);

  try {
    const res = await fetch("/api/admin/upload-image", {
      method: "POST",
      body: formData,
      credentials: "include",   // important for cookies/auth
    });

    if (!res.ok) throw new Error("Upload failed");

    const data = await res.json();
    setNewProduct({ ...newProduct, image: data.imageUrl });

    console.log("✅ Image uploaded successfully:", data.imageUrl);
  } catch (error) {
    console.error("Upload error:", error);
    alert("Failed to upload image. Make sure server is running.");
  }
};
  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      const res = await fetch(`/api/admin/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProduct),
      });
      if (res.ok) {
        setEditingProduct(null);
        fetchData();
      }
    } catch (err) {
      console.error('Failed to update product:', err);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setIsDeletingProduct(null);
        fetchData();
      }
    } catch (err) {
      console.error('Failed to delete product:', err);
    }
  };

  const handleLogout = async () => {
    setAdminUser(null);
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };


  const handleGoogleLogin = async () => {
    try {
      const user = await signInWithGoogle();
      if (user.email === ADMIN_EMAIL) {
        // Sync with backend to get the session cookie
        const res = await fetch('/api/auth/admin-sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email })
        });
        
        if (res.ok) {
          setAdminUser(user);
          window.location.reload(); // Refresh to update global auth state in App.tsx
        } else {
          alert('Failed to synchronize admin session with backend.');
        }
      } else {
        alert('Access Denied: This account is not authorized for the Admin Portal.');
      }
    } catch (error) {
      console.error('Google Login Error:', error);
    }
  };

  if (loading && !adminUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-neon-cyan/20 border-t-neon-cyan rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!adminUser || (adminUser.email !== ADMIN_EMAIL && adminUser.email !== 'admin@haidersmart.pk')) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full glass-card p-12 text-center border-neon-cyan/30"
        >
          <div className="w-20 h-20 bg-neon-cyan/20 rounded-3xl flex items-center justify-center text-neon-cyan mx-auto mb-8 shadow-[0_0_30px_rgba(0,210,255,0.2)]">
            <ShieldCheck size={40} />
          </div>
          <h2 className="text-3xl font-black font-display uppercase tracking-tighter mb-4">Admin <span className="text-neon-cyan">Access</span></h2>
          <p className="text-white/40 text-sm mb-10 leading-relaxed uppercase tracking-widest font-bold">
            Secure node access required. Please authenticate with an authorized Google account.
          </p>
          
          <button 
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white text-black py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-neon-cyan hover:text-black transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          >
            <LogIn size={20} />
            Authenticate with Google
          </button>

          <div className="mt-6">
            <a 
              href="/login" 
              className="text-[10px] text-white/40 hover:text-neon-cyan transition-colors uppercase font-bold tracking-widest"
            >
              Or use manual access key
            </a>
          </div>
          
          <div className="mt-8 pt-8 border-t border-white/5">
            <p className="text-[10px] text-white/20 font-mono uppercase tracking-widest">Authorized Personnel Only // Node_01</p>
          </div>
        </motion.div>
      </div>
    );
  }

  const stats = [
    { label: 'Total Revenue', value: `Rs. ${(Array.isArray(orders) ? orders.reduce((acc, o) => acc + (o.total || 0), 0) : 0).toLocaleString()}`, icon: TrendingUp, color: 'text-neon-cyan' },
    { label: 'Active Orders', value: Array.isArray(orders) ? orders.filter(o => o.status === 'Processing').length : 0, icon: ShoppingBag, color: 'text-neon-orange' },
    { label: 'Inventory Items', value: Array.isArray(products) ? products.length : 0, icon: Package, color: 'text-neon-magenta' },
    { label: 'System Node', value: 'KARACHI_01', icon: LayoutDashboard, color: 'text-white/40' },
  ];

  return (
    <div className="min-h-screen pt-24 px-6 pb-12">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <div className="glass-card p-6 sticky top-32 border-neon-cyan/20">
            <div className="flex items-center gap-3 mb-10 px-2">
              <div className="w-10 h-10 bg-neon-orange rounded-lg flex items-center justify-center font-black text-xl italic">H</div>
              <div>
                <div className="text-xs font-black font-display uppercase tracking-tighter">Admin <span className="text-neon-cyan">Portal</span></div>
                <div className="text-[8px] text-white/30 uppercase tracking-widest font-bold">System Node 01</div>
              </div>
            </div>

            <nav className="space-y-2">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'products', label: 'Inventory', icon: Package },
                { id: 'orders', label: 'Orders', icon: ShoppingBag },
                { id: 'marketing', label: 'Marketing', icon: Megaphone },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                    activeTab === tab.id 
                      ? 'bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20' 
                      : 'text-white/40 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <tab.icon size={18} />
                  {tab.label}
                </button>
              ))}
              
              <div className="pt-8 mt-8 border-t border-white/5">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-red-500/60 hover:text-red-500 hover:bg-red-500/5 transition-all"
                >
                  <LogOut size={18} />
                  Terminate Session
                </button>
              </div>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {stats.map((stat, i) => (
                    <div key={i} className="glass-card p-6 border-white/5 group hover:border-neon-cyan/30 transition-all">
                      <div className="flex items-center justify-between mb-4">
                        <stat.icon className={stat.color} size={24} />
                        <div className="text-[10px] uppercase font-bold text-white/20 tracking-widest">Real-time</div>
                      </div>
                      <div className="text-2xl font-black font-display mb-1">{stat.value}</div>
                      <div className="text-[10px] uppercase font-bold text-white/40 tracking-widest">{stat.label}</div>
                    </div>
                  ))}
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                  <div className="glass-card p-8 border-white/5">
                    <h3 className="text-xl font-black font-display uppercase tracking-tighter mb-6">Recent <span className="text-neon-orange">Orders</span></h3>
                    <div className="space-y-4">
                      {Array.isArray(orders) && orders.slice(0, 5).map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-neon-orange/20 flex items-center justify-center text-neon-orange">
                              <ShoppingBag size={20} />
                            </div>
                            <div>
                              <div className="text-xs font-bold">{order.id}</div>
                              <div className="text-[10px] text-white/40 uppercase font-bold">{order.customer.name}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs font-black text-neon-cyan">Rs. {order.total.toLocaleString()}</div>
                            <div className="text-[10px] text-white/40 uppercase font-bold">{order.status}</div>
                          </div>
                        </div>
                      ))}
                      {Array.isArray(orders) && orders.length === 0 && <div className="text-center py-12 text-white/20 uppercase text-xs font-bold">No orders yet</div>}
                    </div>
                  </div>

                  <div className="glass-card p-8 border-white/5">
                    <h3 className="text-xl font-black font-display uppercase tracking-tighter mb-6">System <span className="text-neon-magenta">Status</span></h3>
                    <div className="space-y-6">
                      {[
                        { label: 'Database Node', status: 'Operational', icon: CheckCircle2, color: 'text-green-500' },
                        { label: 'Payment Gateway', status: 'Operational', icon: CheckCircle2, color: 'text-green-500' },
                        { label: 'Shipping API', status: 'Syncing', icon: Clock, color: 'text-yellow-500' },
                        { label: 'AI Rec Engine', status: 'Operational', icon: CheckCircle2, color: 'text-green-500' },
                      ].map((sys, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="text-xs font-bold text-white/60 uppercase tracking-widest">{sys.label}</div>
                          <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${sys.color}`}>
                            <sys.icon size={14} />
                            {sys.status}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'products' && (
              <motion.div
                key="products"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-black font-display uppercase tracking-tighter">Inventory <span className="text-neon-cyan">Management</span></h2>
                  <button 
                    onClick={() => setIsAddingProduct(true)}
                    className="neon-button-orange flex items-center gap-2"
                  >
                    <Plus size={20} />
                    Add Product
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {Array.isArray(products) && products.map((product) => (
                    <div key={product.id} className="glass-card p-4 border-white/5 group relative">
                      <div className="aspect-square rounded-xl overflow-hidden mb-4 bg-white/5">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                      </div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold">{product.name}</h3>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setEditingProduct(product)}
                            className="p-2 rounded-lg bg-white/5 text-white/40 hover:text-neon-cyan transition-colors"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button 
                            onClick={() => setIsDeletingProduct(product.id)}
                            className="p-2 rounded-lg bg-white/5 text-white/40 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="text-[10px] text-white/40 uppercase font-bold mb-4">{product.category}</div>
                      <div className="text-xl font-black font-display text-neon-cyan">Rs. {product.price.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'orders' && (
              <motion.div
                key="orders"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <h2 className="text-3xl font-black font-display uppercase tracking-tighter">Order <span className="text-neon-orange">Manifest</span></h2>
                
                <div className="glass-card overflow-hidden border-white/5">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white/5 text-[10px] uppercase font-bold tracking-widest text-white/40">
                        <th className="px-6 py-4">Order ID</th>
                        <th className="px-6 py-4">Customer</th>
                        <th className="px-6 py-4">Items</th>
                        <th className="px-6 py-4">Total</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Node</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {Array.isArray(orders) && orders.map((order) => (
                        <tr key={order.id} className="text-xs hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 font-mono text-neon-cyan">{order.id}</td>
                          <td className="px-6 py-4">
                            <div className="font-bold">{order.customer.name}</div>
                            <div className="text-[10px] text-white/40">{order.customer.email}</div>
                          </td>
                          <td className="px-6 py-4 text-white/60">{order.items.length} items</td>
                          <td className="px-6 py-4 font-black">Rs. {order.total.toLocaleString()}</td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 rounded bg-neon-orange/10 text-neon-orange text-[10px] font-bold uppercase tracking-widest">
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-white/40 font-mono">{order.node}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {Array.isArray(orders) && orders.length === 0 && <div className="text-center py-24 text-white/20 uppercase text-xs font-bold">No orders processed yet</div>}
                </div>
              </motion.div>
            )}
            {activeTab === 'marketing' && (
              <motion.div
                key="marketing"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <h2 className="text-3xl font-black font-display uppercase tracking-tighter">Marketing <span className="text-neon-magenta">& Comms</span></h2>
                
                <div className="glass-card p-8 border-white/5">
                  <h3 className="text-xl font-black font-display uppercase tracking-tighter mb-6">Announcement <span className="text-neon-cyan">Bar</span></h3>
                  <form onSubmit={handleUpdateAnnouncement} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-4">Announcement Text</label>
                      <input 
                        type="text" 
                        required
                        value={announcement.text}
                        onChange={(e) => setAnnouncement({ ...announcement, text: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-full px-6 py-3 focus:outline-none focus:border-neon-cyan transition-all text-sm"
                        placeholder="e.g. MEGA SALE: UP TO 50% OFF!"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-4">Target Link</label>
                        <input 
                          type="text" 
                          value={announcement.link}
                          onChange={(e) => setAnnouncement({ ...announcement, link: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-full px-6 py-3 focus:outline-none focus:border-neon-cyan transition-all text-sm"
                          placeholder="#"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-4">Theme Color</label>
                        <select 
                          value={announcement.color}
                          onChange={(e) => setAnnouncement({ ...announcement, color: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-full px-6 py-3 focus:outline-none focus:border-neon-cyan transition-all text-sm appearance-none"
                        >
                          <option value="cyan">Neon Cyan</option>
                          <option value="magenta">Neon Magenta</option>
                          <option value="orange">Neon Orange</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <button 
                        type="button"
                        onClick={() => setAnnouncement({ ...announcement, isActive: !announcement.isActive })}
                        className={`px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                          announcement.isActive ? 'bg-green-500/20 text-green-500 border border-green-500/30' : 'bg-red-500/20 text-red-500 border border-red-500/30'
                        }`}
                      >
                        {announcement.isActive ? 'Status: Active' : 'Status: Inactive'}
                      </button>
                      <button type="submit" className="neon-button-cyan">Update Announcement</button>
                    </div>
                  </form>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                  <div className="glass-card p-8 border-white/5">
                    <h3 className="text-xl font-black font-display uppercase tracking-tighter mb-6">Sale <span className="text-neon-magenta">Insights</span></h3>
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                        <div className="text-xs font-bold uppercase tracking-widest text-white/40">Products on Sale</div>
                        <div className="text-xl font-black font-display text-neon-magenta">
                          {products.filter(p => p.discountPercentage && p.discountPercentage > 0).length}
                        </div>
                      </div>
                      <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                        <div className="text-xs font-bold uppercase tracking-widest text-white/40">Avg. Discount</div>
                        <div className="text-xl font-black font-display text-neon-cyan">
                          {Math.round(products.reduce((acc, p) => acc + (p.discountPercentage || 0), 0) / (products.filter(p => p.discountPercentage).length || 1))}%
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="glass-card p-8 border-white/5 flex flex-col items-center justify-center text-center">
                    <Percent size={48} className="text-neon-magenta mb-4 animate-bounce" />
                    <p className="text-xs font-bold uppercase tracking-widest text-white/40">Marketing node is active and transmitting</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Add Product Modal */}
      {/* ADD PRODUCT MODAL */}
<AnimatePresence>
  {isAddingProduct && (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        onClick={() => setIsAddingProduct(false)} 
        className="absolute inset-0 bg-black/80 backdrop-blur-xl" 
      />
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-lg glass-card p-10 border-neon-cyan/30"
      >
        <h3 className="text-2xl font-black font-display uppercase tracking-tighter mb-8">
          New <span className="text-neon-cyan">Product</span>
        </h3>

        <form onSubmit={handleAddProduct} className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-4">Product Name</label>
            <input 
              type="text" 
              required
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-full px-6 py-3 focus:outline-none focus:border-neon-cyan transition-all text-sm"
            />
          </div>
          {/* GLB 3D Model Upload */}


          {/* Category + Original Price */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-4">Category</label>
              <select 
                value={newProduct.category}
                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-full px-6 py-3 focus:outline-none focus:border-neon-cyan transition-all text-sm appearance-none"
              >
                <option value="Garments">Garments</option>
                <option value="Pharmacy">Pharmacy</option>
                <option value="Skincare">Skincare</option>
                <option value="Styling">Styling</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-4">Original Price (PKR)</label>
              <input 
                type="number" 
                required
                value={newProduct.originalPrice}
                onChange={(e) => {
                  const original = parseInt(e.target.value) || 0;
                  const discount = newProduct.discountPercentage || 0;
                  const final = Math.round(original - (original * (discount / 100)));
                  setNewProduct({ ...newProduct, originalPrice: original, price: final });
                }}
                className="w-full bg-white/5 border border-white/10 rounded-full px-6 py-3 focus:outline-none focus:border-neon-cyan transition-all text-sm"
              />
            </div>
          </div>

          {/* Discount + Final Price */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-4">Discount (%)</label>
              <input 
                type="number" 
                min="0"
                max="100"
                value={newProduct.discountPercentage}
                onChange={(e) => {
                  const discount = parseInt(e.target.value) || 0;
                  const original = newProduct.originalPrice || 0;
                  const final = Math.round(original - (original * (discount / 100)));
                  setNewProduct({ ...newProduct, discountPercentage: discount, price: final });
                }}
                className="w-full bg-white/5 border border-white/10 rounded-full px-6 py-3 focus:outline-none focus:border-neon-cyan transition-all text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-4">Final Price (PKR)</label>
              <div className="w-full bg-white/10 border border-neon-cyan/30 rounded-full px-6 py-3 text-sm font-black text-neon-cyan">
                Rs. {newProduct.price.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-4">Description</label>
            <textarea 
              required
              value={newProduct.description}
              onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-3 focus:outline-none focus:border-neon-cyan transition-all text-sm h-32 resize-none"
            />
          </div>

          {/* IMAGE UPLOAD - MOST IMPORTANT PART */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-4">
              Product Image <span className="text-red-400">(Required)</span>
            </label>
            <input 
              type="file" 
              accept="image/*"
              required={!newProduct.image}
              onChange={handleImageUpload}
              className="w-full bg-white/5 border border-white/10 rounded-full px-6 py-3 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-neon-cyan file:text-black file:font-bold"
            />
            
            {newProduct.image && (
              <div className="mt-2">
                <img 
                  src={newProduct.image} 
                  alt="preview" 
                  className="w-40 h-40 object-cover rounded-xl border border-white/20" 
                />
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-6">
            <button 
              type="button"
              onClick={() => setIsAddingProduct(false)}
              className="flex-1 px-8 py-3 rounded-full border border-white/10 font-bold uppercase tracking-widest hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={!newProduct.image}
              className="flex-1 neon-button-orange disabled:opacity-50"
            >
              Add Product
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )}
</AnimatePresence>
      {/* Edit Product Modal */}
      <AnimatePresence>
        {editingProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingProduct(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-lg glass-card p-10 border-neon-cyan/30"
            >
              <h3 className="text-2xl font-black font-display uppercase tracking-tighter mb-8">Edit <span className="text-neon-cyan">Product</span></h3>
              <form onSubmit={handleUpdateProduct} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-4">Product Name</label>
                  <input 
                    type="text" 
                    required
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-full px-6 py-3 focus:outline-none focus:border-neon-cyan transition-all text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-4">Category</label>
                    <select 
                      value={editingProduct.category}
                      onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-full px-6 py-3 focus:outline-none focus:border-neon-cyan transition-all text-sm appearance-none"
                    >
                      <option value="Garments">Garments</option>
                      <option value="Pharmacy">Pharmacy</option>
                      <option value="Skincare">Skincare</option>
                      <option value="Styling">Styling</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-4">Original Price (PKR)</label>
                    <input 
                      type="number" 
                      required
                      value={editingProduct.originalPrice || editingProduct.price}
                      onChange={(e) => {
                        const original = parseInt(e.target.value);
                        const discount = editingProduct.discountPercentage || 0;
                        const final = original - (original * (discount / 100));
                        setEditingProduct({ ...editingProduct, originalPrice: original, price: Math.round(final) });
                      }}
                      className="w-full bg-white/5 border border-white/10 rounded-full px-6 py-3 focus:outline-none focus:border-neon-cyan transition-all text-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-4">Discount (%)</label>
                    <input 
                      type="number" 
                      required
                      min="0"
                      max="100"
                      value={editingProduct.discountPercentage || 0}
                      onChange={(e) => {
                        const discount = parseInt(e.target.value);
                        const original = editingProduct.originalPrice || editingProduct.price;
                        const final = original - (original * (discount / 100));
                        setEditingProduct({ ...editingProduct, discountPercentage: discount, price: Math.round(final) });
                      }}
                      className="w-full bg-white/5 border border-white/10 rounded-full px-6 py-3 focus:outline-none focus:border-neon-cyan transition-all text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-4">Final Price (PKR)</label>
                    <div className="w-full bg-white/10 border border-neon-cyan/30 rounded-full px-6 py-3 text-sm font-black text-neon-cyan">
                      Rs. {editingProduct.price.toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-4">Description</label>
                  <textarea 
                    required
                    value={editingProduct.description}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-3 focus:outline-none focus:border-neon-cyan transition-all text-sm h-32 resize-none"
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="flex-1 px-8 py-3 rounded-full border border-white/10 font-bold uppercase tracking-widest hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 neon-button-cyan"
                  >
                    Update
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeletingProduct && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeletingProduct(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm glass-card p-8 border-red-500/30 text-center"
            >
              <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center text-red-500 mx-auto mb-6">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-xl font-black font-display uppercase tracking-tighter mb-2">Confirm <span className="text-red-500">Deletion</span></h3>
              <p className="text-white/40 text-xs mb-8 uppercase tracking-widest font-bold">This action cannot be undone. Are you sure?</p>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => setIsDeletingProduct(null)}
                  className="flex-1 px-6 py-3 rounded-full border border-white/10 text-xs font-bold uppercase tracking-widest hover:bg-white/5 transition-colors"
                >
                  Abort
                </button>
                <button 
                  onClick={() => handleDeleteProduct(isDeletingProduct)}
                  className="flex-1 bg-red-500 text-white py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-red-600 transition-colors shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
