import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Plus, 
  Trash2, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  LogOut,
  LogIn,
  ShieldCheck,
  Megaphone,
  Upload,
  X,
  Image as ImageIcon,
  Edit3,
  AlertCircle
} from 'lucide-react';
import { signInWithGoogle } from '../firebase';

// --- TYPES ---
interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  image: string;        // Main cover image (Legacy support)
  images?: string[];    // NEW: Full Gallery Array
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
  // --- STATE ---
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'marketing'>('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [announcement, setAnnouncement] = useState({ text: '', isActive: true, link: '', color: 'cyan' });
  const [loading, setLoading] = useState(true);
  
  // Modals & Auth State
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDeletingProduct, setIsDeletingProduct] = useState<string | null>(null);
  const [adminUser, setAdminUser] = useState<any>(null);
  
  // NEW: Product Form State with 'images' array
  const [newProduct, setNewProduct] = useState<{
    name: string;
    category: string;
    price: number;
    originalPrice: number;
    discountPercentage: number;
    image: string;
    images: string[]; // <--- The Gallery
    description: string;
  }>({
    name: '',
    category: 'Garments',
    price: 0,
    originalPrice: 0,
    discountPercentage: 0,
    image: '',
    images: [], 
    description: ''
  });

  // --- AUTH & DATA FETCHING ---
  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user && (data.user.role === 'admin' || data.user.email === ADMIN_EMAIL)) {
          setAdminUser(data.user);
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

  // --- NEW: MULTI-IMAGE LOGIC ---
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("/api/admin/upload-image", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      const uploadedUrl = data.imageUrl;

      setNewProduct(prev => {
        // If this is the first image, set it as the MAIN image too
        const isFirst = prev.images.length === 0;
        return {
          ...prev,
          image: isFirst ? uploadedUrl : prev.image, 
          images: [...prev.images, uploadedUrl] // Append to array
        };
      });

    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload. Check server logs.");
    }
  };

  const removeImage = (indexToRemove: number) => {
    setNewProduct(prev => {
      const newImages = prev.images.filter((_, i) => i !== indexToRemove);
      return {
        ...prev,
        images: newImages,
        // If we deleted the main image, set the new first image as main
        image: indexToRemove === 0 ? (newImages[0] || '') : prev.image
      };
    });
  };

  // --- HANDLERS ---
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
        setNewProduct({
            name: '', category: 'Garments', price: 0, originalPrice: 0, 
            discountPercentage: 0, image: '', images: [], description: ''
        });
        fetchData();
      }
    } catch (err) {
      console.error('Failed to add product:', err);
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
    } catch (err) { console.error(err); }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setIsDeletingProduct(null); // Close modal
        fetchData();
      }
    } catch (err) {
      console.error('Failed to delete product:', err);
    }
  };

  const handleUpdateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/admin/announcement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(announcement),
      });
      alert('Announcement updated!');
    } catch (err) { console.error(err); }
  };

  const handleLogout = async () => {
    setAdminUser(null);
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  const handleGoogleLogin = async () => {
    try {
      const user = await signInWithGoogle();
      if (user.email === ADMIN_EMAIL || user.email === 'admin@haidersmart.pk') {
        setAdminUser(user);
      } else {
        alert('Access Denied.');
      }
    } catch (error) { console.error(error); }
  };

  // --- LOADING STATE ---
  if (loading && !adminUser) {
    return <div className="min-h-screen flex items-center justify-center bg-[#050505] text-neon-cyan">Loading Node...</div>;
  }

  // --- LOGIN SCREEN ---
  if (!adminUser) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#050505]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full glass-card p-12 text-center border-neon-cyan/30">
          <div className="w-20 h-20 bg-neon-cyan/20 rounded-3xl flex items-center justify-center text-neon-cyan mx-auto mb-8 shadow-[0_0_30px_rgba(0,210,255,0.2)]">
            <ShieldCheck size={40} />
          </div>
          <h2 className="text-3xl font-black font-display uppercase tracking-tighter mb-4 text-white">Admin Access</h2>
          <button onClick={handleGoogleLogin} className="w-full flex items-center justify-center gap-3 bg-white text-black py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-neon-cyan transition-all">
            <LogIn size={20} /> Authenticate
          </button>
        </motion.div>
      </div>
    );
  }

  // --- DASHBOARD STATS ---
  const stats = [
    { label: 'Total Revenue', value: `Rs. ${(Array.isArray(orders) ? orders.reduce((acc, o) => acc + (o.total || 0), 0) : 0).toLocaleString()}`, icon: TrendingUp, color: 'text-neon-cyan' },
    { label: 'Active Orders', value: Array.isArray(orders) ? orders.filter(o => o.status === 'Processing').length : 0, icon: ShoppingBag, color: 'text-neon-orange' },
    { label: 'Inventory Items', value: Array.isArray(products) ? products.length : 0, icon: Package, color: 'text-neon-magenta' },
  ];

  return (
    <div className="min-h-screen pt-24 px-6 pb-12 bg-[#050505] text-white">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        
        {/* --- SIDEBAR --- */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <div className="glass-card p-6 sticky top-32 border-neon-cyan/20">
            <div className="flex items-center gap-3 mb-10 px-2">
              <div className="w-10 h-10 bg-neon-orange rounded-lg flex items-center justify-center font-black text-xl italic">H</div>
              <div>
                <div className="text-xs font-black font-display uppercase tracking-tighter">Admin <span className="text-neon-cyan">Portal</span></div>
                <div className="text-[8px] text-white/30 uppercase tracking-widest font-bold">Node_01</div>
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
                    activeTab === tab.id ? 'bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20' : 'text-white/40 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <tab.icon size={18} /> {tab.label}
                </button>
              ))}
              <div className="pt-8 mt-8 border-t border-white/5">
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-red-500/60 hover:text-red-500 hover:bg-red-500/5 transition-all">
                  <LogOut size={18} /> Terminate
                </button>
              </div>
            </nav>
          </div>
        </aside>

        {/* --- MAIN CONTENT --- */}
        <main className="flex-1">
          <AnimatePresence mode="wait">
            
            {/* TAB: DASHBOARD */}
            {activeTab === 'dashboard' && (
              <motion.div key="dashboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {stats.map((stat, i) => (
                    <div key={i} className="glass-card p-6 border-white/5">
                      <div className="flex items-center justify-between mb-4">
                        <stat.icon className={stat.color} size={24} />
                        <div className="text-[10px] uppercase font-bold text-white/20">Real-time</div>
                      </div>
                      <div className="text-2xl font-black font-display mb-1">{stat.value}</div>
                      <div className="text-[10px] uppercase font-bold text-white/40">{stat.label}</div>
                    </div>
                  ))}
                </div>
                <div className="glass-card p-8 border-white/5">
                  <h3 className="text-xl font-black font-display uppercase tracking-tighter mb-6">System Status</h3>
                  <div className="space-y-4">
                     {[
                        { label: 'Database Node', status: 'Operational', icon: CheckCircle2, color: 'text-green-500' },
                        { label: 'Payment Gateway', status: 'Operational', icon: CheckCircle2, color: 'text-green-500' },
                        { label: 'Shipping API', status: 'Syncing', icon: Clock, color: 'text-yellow-500' },
                      ].map((sys, i) => (
                        <div key={i} className="flex items-center justify-between border-b border-white/5 pb-3 last:border-0">
                          <div className="text-xs font-bold text-white/60 uppercase tracking-widest">{sys.label}</div>
                          <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${sys.color}`}>
                            <sys.icon size={14} /> {sys.status}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB: PRODUCTS */}
            {activeTab === 'products' && (
              <motion.div key="products" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-3xl font-black font-display uppercase tracking-tighter">Inventory <span className="text-neon-cyan">Node</span></h2>
                  <button onClick={() => setIsAddingProduct(true)} className="bg-neon-cyan text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:shadow-[0_0_20px_rgba(0,210,255,0.4)] transition-all">
                    <Plus size={20} /> Add Product
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {products.map(p => (
                    <div key={p.id} className="glass-card p-4 group hover:border-neon-cyan/30 transition-all">
                      <div className="flex gap-4 mb-4">
                        <div className="w-16 h-16 rounded-lg bg-white/5 overflow-hidden flex-shrink-0 relative">
                          <img src={p.image} alt="" className="w-full h-full object-cover" />
                          {/* MULTI-IMAGE BADGE */}
                          {p.images && p.images.length > 1 && (
                            <div className="absolute bottom-0 right-0 bg-black/80 text-[8px] px-1.5 py-0.5 font-bold text-white">
                              +{p.images.length - 1}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold truncate text-sm">{p.name}</h3>
                          <p className="text-xs text-neon-cyan font-mono mt-1">Rs. {p.price.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center border-t border-white/5 pt-3">
                        <span className="text-[10px] uppercase font-bold text-white/30">{p.category}</span>
                        <div className="flex gap-2">
                          <button onClick={() => setEditingProduct(p)} className="text-white/20 hover:text-neon-cyan transition-colors">
                            <Edit3 size={16} />
                          </button>
                          <button onClick={() => setIsDeletingProduct(p.id)} className="text-white/20 hover:text-red-500 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* TAB: ORDERS */}
            {activeTab === 'orders' && (
               <motion.div key="orders" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                 <h2 className="text-3xl font-black font-display uppercase tracking-tighter mb-8">Order <span className="text-neon-orange">Manifest</span></h2>
                 <div className="glass-card overflow-hidden border-white/5">
                    <table className="w-full text-left">
                      <thead className="bg-white/5 text-[10px] uppercase font-bold text-white/40">
                        <tr>
                          <th className="px-6 py-4">ID</th>
                          <th className="px-6 py-4">Customer</th>
                          <th className="px-6 py-4">Total</th>
                          <th className="px-6 py-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {orders.map(order => (
                          <tr key={order.id} className="text-xs">
                            <td className="px-6 py-4 font-mono text-neon-cyan">{order.id.slice(0,8)}...</td>
                            <td className="px-6 py-4">{order.customer?.name}</td>
                            <td className="px-6 py-4 font-black">Rs. {order.total}</td>
                            <td className="px-6 py-4"><span className="bg-white/10 px-2 py-1 rounded">{order.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {orders.length === 0 && <div className="p-12 text-center text-white/20 text-xs">No orders found</div>}
                 </div>
               </motion.div>
            )}

            {/* TAB: MARKETING */}
            {activeTab === 'marketing' && (
              <motion.div key="marketing" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <h2 className="text-3xl font-black font-display uppercase tracking-tighter mb-8">Marketing <span className="text-neon-magenta">Comms</span></h2>
                <div className="glass-card p-8 border-white/5">
                  <h3 className="text-xl font-bold mb-6">Announcement Bar</h3>
                  <form onSubmit={handleUpdateAnnouncement} className="space-y-6">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Text</label>
                      <input className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm" value={announcement.text} onChange={e => setAnnouncement({...announcement, text: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Link</label>
                           <input className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm" value={announcement.link} onChange={e => setAnnouncement({...announcement, link: e.target.value})} />
                        </div>
                         <div>
                           <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Color</label>
                           <select className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm" value={announcement.color} onChange={e => setAnnouncement({...announcement, color: e.target.value})}>
                             <option value="cyan">Cyan</option>
                             <option value="magenta">Magenta</option>
                             <option value="orange">Orange</option>
                           </select>
                        </div>
                    </div>
                    <div className="flex gap-4">
                      <button type="button" onClick={() => setAnnouncement({...announcement, isActive: !announcement.isActive})} className={`flex-1 py-3 rounded-lg text-xs font-bold uppercase border ${announcement.isActive ? 'border-green-500 text-green-500' : 'border-red-500 text-red-500'}`}>
                        {announcement.isActive ? 'Active' : 'Inactive'}
                      </button>
                      <button type="submit" className="flex-1 bg-neon-cyan text-black font-bold rounded-lg uppercase text-xs">Save Changes</button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </main>

        {/* --- ADD PRODUCT MODAL --- */}
        <AnimatePresence>
          {isAddingProduct && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="glass-card w-full max-w-2xl rounded-3xl p-8 max-h-[90vh] overflow-y-auto border-neon-cyan/20">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Initialize <span className="text-neon-cyan">Product</span></h2>
                  <button onClick={() => setIsAddingProduct(false)}><X className="text-white/50 hover:text-white" /></button>
                </div>

                <form onSubmit={handleAddProduct} className="space-y-6">
                  
                  {/* --- NEW IMAGE GALLERY UI --- */}
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <label className="text-xs font-bold uppercase tracking-widest text-neon-cyan flex items-center gap-2 mb-3">
                      <ImageIcon size={14}/> Gallery ({newProduct.images.length})
                    </label>
                    
                    <div className="flex flex-wrap gap-3">
                      {/* Upload Button */}
                      <label className="w-20 h-20 rounded-xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-neon-cyan hover:bg-white/5 transition-all group">
                        <Upload size={16} className="text-white/50 group-hover:text-neon-cyan" />
                        <span className="text-[8px] font-bold text-white/50 uppercase tracking-widest">Add</span>
                        <input type="file" hidden onChange={handleImageUpload} accept="image/*" />
                      </label>

                      {/* Thumbnails */}
                      {newProduct.images.map((img, idx) => (
                        <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden group border border-white/10">
                          <img src={img} alt="" className="w-full h-full object-cover" />
                          <button 
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 flex items-center justify-center text-red-500 transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                          {idx === 0 && <div className="absolute bottom-0 w-full bg-neon-cyan text-black text-[7px] font-black text-center py-0.5 uppercase">Cover</div>}
                        </div>
                      ))}
                    </div>
                    {newProduct.images.length === 0 && <div className="text-[10px] text-white/30 italic">No images uploaded. Add at least one.</div>}
                  </div>
                  {/* --------------------------- */}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-white/40 mb-1">Name</label>
                      <input className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} required />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-white/40 mb-1">Category</label>
                      <select className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
                        <option>Garments</option>
                        <option>Pharmacy</option>
                        <option>Styling</option>
                        <option>Tech</option>
                      </select>
                    </div>
                  </div>

                  {/* AUTO-CALC PRICE LOGIC */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-white/40 mb-1">Original Price</label>
                      <input 
                        type="number" 
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white"
                        value={newProduct.originalPrice} 
                        onChange={(e) => {
                          const original = parseInt(e.target.value) || 0;
                          const discount = newProduct.discountPercentage || 0;
                          const final = Math.round(original - (original * (discount / 100)));
                          setNewProduct({ ...newProduct, originalPrice: original, price: final });
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-white/40 mb-1">Discount %</label>
                      <input 
                        type="number" 
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white" 
                        value={newProduct.discountPercentage} 
                        onChange={(e) => {
                          const discount = parseInt(e.target.value) || 0;
                          const original = newProduct.originalPrice || 0;
                          const final = Math.round(original - (original * (discount / 100)));
                          setNewProduct({ ...newProduct, discountPercentage: discount, price: final });
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-white/40 mb-1">Final Price</label>
                      <div className="w-full bg-white/10 border border-neon-cyan/30 rounded-lg px-4 py-3 text-sm font-black text-neon-cyan">
                         Rs. {newProduct.price.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-white/40 mb-1">Description</label>
                    <textarea rows={4} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} />
                  </div>

                  <button type="submit" className="w-full bg-neon-cyan text-black font-black uppercase tracking-widest py-4 rounded-xl hover:shadow-[0_0_30px_rgba(0,210,255,0.4)] transition-all">
                    Upload to Network
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* EDIT MODAL */}
        <AnimatePresence>
          {editingProduct && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="glass-card p-8 max-w-md w-full border-neon-cyan/30">
                <h3 className="text-xl font-bold mb-4">Edit Product</h3>
                <form onSubmit={handleUpdateProduct} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-white/40 mb-1">Name</label>
                      <input className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white" value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} />
                    </div>
                    <div className="flex gap-2">
                        <button type="button" onClick={() => setEditingProduct(null)} className="flex-1 border border-white/20 py-2 rounded-lg hover:bg-white/5">Cancel</button>
                        <button type="submit" className="flex-1 bg-neon-cyan text-black font-bold rounded-lg">Save</button>
                    </div>
                </form>
              </div>
             </motion.div>
          )}
        </AnimatePresence>

        {/* DELETE CONFIRMATION MODAL */}
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
    </div>
  );
}
