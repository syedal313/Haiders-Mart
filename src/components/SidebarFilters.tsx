import { motion, AnimatePresence } from 'motion/react';
import { X, Filter, Check } from 'lucide-react';

interface Filters {
  categories: string[];
  priceRange: [number, number]; // [min, max]
  minRating: number;
}

interface SidebarFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  filters: Filters;
  setFilters: (filters: Filters) => void;
  maxPrice: number;
  variant?: 'drawer' | 'static'; // ← NEW: makes desktop clean
}

export default function SidebarFilters({
  isOpen,
  onClose,
  filters,
  setFilters,
  maxPrice,
  variant = 'drawer',
}: SidebarFiltersProps) {
  const categories = ['Garments', 'Pharmacy', 'Skincare', 'Styling'];

  const toggleCategory = (cat: string) => {
    const newCats = filters.categories.includes(cat)
      ? filters.categories.filter((c) => c !== cat)
      : [...filters.categories, cat];
    setFilters({ ...filters, categories: newCats });
  };

  const updatePrice = (newRange: [number, number]) => {
    setFilters({ ...filters, priceRange: newRange });
  };

  const isStatic = variant === 'static';

  const content = (
    <>
      {/* Header - hidden on static desktop */}
      {!isStatic && (
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black font-display uppercase tracking-tighter flex items-center gap-2">
            <Filter size={20} className="text-neon-cyan" />
            Filters
          </h2>
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>
      )}

      <div className="space-y-10 flex-1">
        {/* Categories */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">Category</h3>
          <div className="space-y-3">
            {categories.map((cat) => {
              const isSelected = filters.categories.includes(cat);
              return (
                <label
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className="flex items-center gap-3 cursor-pointer group select-none"
                >
                  <div
                    className={`w-5 h-5 rounded border transition-all flex items-center justify-center ${
                      isSelected
                        ? 'bg-neon-cyan border-neon-cyan shadow-[0_0_10px_#00D2FF]'
                        : 'border-white/20 group-hover:border-neon-cyan/50'
                    }`}
                  >
                    {isSelected && <Check size={14} className="text-black" />}
                  </div>
                  <span
                    className={`text-sm font-medium transition-colors ${
                      isSelected ? 'text-white' : 'text-white/60 group-hover:text-white'
                    }`}
                  >
                    {cat}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Price Range - Now TRUE min + max */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">Price Range</h3>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <input
                  type="range"
                  min="0"
                  max={maxPrice}
                  value={filters.priceRange[0]}
                  onChange={(e) => updatePrice([parseInt(e.target.value), filters.priceRange[1]])}
                  className="w-full accent-neon-cyan h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                />
                <div className="text-xs font-mono text-white/60 mt-1">Rs. {filters.priceRange[0].toLocaleString()}</div>
              </div>
              <div className="flex-1">
                <input
                  type="range"
                  min="0"
                  max={maxPrice}
                  value={filters.priceRange[1]}
                  onChange={(e) => updatePrice([filters.priceRange[0], parseInt(e.target.value)])}
                  className="w-full accent-neon-magenta h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                />
                <div className="text-xs font-mono text-white/60 mt-1 text-right">Rs. {filters.priceRange[1].toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Min Rating */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">Min Rating</h3>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                onClick={() => setFilters({ ...filters, minRating: rating })}
                className={`flex-1 py-2 rounded-lg border text-xs font-bold transition-all ${
                  filters.minRating === rating
                    ? 'bg-neon-orange border-neon-orange text-white shadow-[0_0_10px_#FF4E00]'
                    : 'border-white/10 text-white/40 hover:border-white/30'
                }`}
              >
                {rating}+
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reset */}
      <div className="mt-auto pt-8">
        <button
          onClick={() =>
            setFilters({
              categories: [],
              priceRange: [0, maxPrice],
              minRating: 0,
            })
          }
          className="w-full py-3 rounded-full border border-white/10 text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-colors"
        >
          Reset All
        </button>
      </div>
    </>
  );

  // STATIC VERSION (Desktop)
  if (isStatic) {
    return (
      <div className="w-64 flex-shrink-0 glass-card p-6 border-r border-white/10 h-fit sticky top-32">
        {content}
      </div>
    );
  }

  // DRAWER VERSION (Mobile)
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
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm lg:hidden"
          />
          {/* Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 bottom-0 w-full max-w-xs z-[70] glass-card rounded-none border-r border-white/10 p-8 flex flex-col overflow-y-auto"
          >
            {content}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
