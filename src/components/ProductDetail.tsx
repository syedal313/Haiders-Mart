import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Star, ShoppingCart, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Clock } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  images: string[];
  image: string;
  description: string;
  rating: number;
  reviews?: { name: string; rating: number; comment: string }[];
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const addToCart = useStore((state) => state.addToCart);

  // Review state
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');

  // Fetch product
  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then((data: Product[]) => {
        const found = data.find(p => p.id === id);
        if (found) {
          const gallery = found.images && found.images.length > 0
            ? found.images
            : [found.image, found.image, found.image];
          setProduct({ ...found, images: gallery });
        }
      });
  }, [id]);
  // Submit review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewRating) return alert('Please select a rating');
    try {
      const res = await fetch(`/api/products/${product?.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: reviewName, rating: reviewRating, comment: reviewComment }),
      });
      if (res.ok) {
        alert('Review submitted!');
        const refreshed = await fetch(`/api/products/${product?.id}`).then(r => r.json());
        setProduct(refreshed);
        setReviewName('');
        setReviewRating(0);
        setReviewComment('');
      }
    } catch (err) {
      console.error(err);
    }
  };
  


  if (!product) return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen pt-24 pb-12 bg-[#050505]">
      <div className="max-w-7xl mx-auto px-6">
        <Link to="/" className="flex items-center gap-2 text-white/60 hover:text-neon-cyan mb-8 transition-colors w-fit">
          <ArrowLeft size={20} /> Back to Catalog
        </Link>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* LEFT: GALLERY */}
          <div className="space-y-4">
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-white/5 border border-white/10 group">
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedImageIndex}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  src={product.images[selectedImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>

              {product.images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImageIndex(prev => prev === 0 ? product.images.length - 1 : prev - 1)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-neon-cyan hover:text-black"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={() => setSelectedImageIndex(prev => prev === product.images.length - 1 ? 0 : prev + 1)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-neon-cyan hover:text-black"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}

              {product.discountPercentage && (
                <div className="absolute top-4 right-4 bg-neon-magenta text-white px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest shadow-[0_0_15px_rgba(255,0,229,0.5)]">
                  -{product.discountPercentage}% OFF
                </div>
              )}
            </div>

            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                      selectedImageIndex === index
                        ? 'border-neon-cyan scale-105 shadow-[0_0_10px_rgba(0,210,255,0.3)]'
                        : 'border-transparent opacity-50 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`View ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: INFO & REVIEWS */}
          <div className="flex flex-col justify-center space-y-8">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-neon-cyan text-xs font-bold uppercase tracking-widest">
                  {product.category}
                </span>
                <div className="flex items-center gap-2 text-neon-orange">
                  <Star size={18} fill="currentColor" />
                  <span className="font-bold text-lg">{product.rating}</span>
                </div>
              </div>

              <h1 className="text-4xl md:text-5xl font-black font-display leading-tight mb-4 text-white">
                {product.name}
              </h1>

              <div className="flex items-end gap-4 mb-6">
                <span className="text-3xl md:text-4xl font-black text-neon-cyan font-display">
                  Rs. {product.price.toLocaleString()}
                </span>
                {product.originalPrice && (
                  <span className="text-base text-white/30 line-through font-bold">
                    Rs. {product.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>

              <p className="text-white/60 leading-relaxed mb-8 text-base">
                {product.description}
              </p>

              <div className="flex flex-wrap gap-4 mb-8">
                <button
                  onClick={() => addToCart(product)}
                  className="flex-1 min-w-[180px] bg-neon-cyan text-black font-black uppercase tracking-widest py-4 rounded-xl hover:shadow-[0_0_30px_rgba(0,210,255,0.4)] transition-all flex items-center justify-center gap-2 group"
                >
                  <ShoppingCart size={20} className="group-hover:scale-110 transition-transform" />
                  Add to Cart
                </button>
                <button className="px-6 py-4 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:text-neon-magenta transition-colors">
                  <Heart size={24} />
                </button>
              </div>
            </div>

            {/* Write a Review */}
            <div className="border-t border-white/10 pt-8">
              <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-4">Write a Review</h3>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold uppercase text-white/40 block mb-1">Name</label>
                  <input
                    type="text"
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-white/40 block mb-1">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((r) => (
                      <button
                        type="button"
                        key={r}
                        onClick={() => setReviewRating(r)}
                        className={`text-2xl ${reviewRating >= r ? 'text-neon-orange' : 'text-white/30'}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-white/40 block mb-1">Comment</label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-neon-cyan text-black font-black uppercase tracking-widest py-3 rounded-xl hover:shadow-[0_0_30px_rgba(0,210,255,0.4)] transition-all"
                >
                  Submit Review
                </button>
              </form>
            </div>

            {/* Existing Reviews */}
            {product.reviews && product.reviews.length > 0 && (
              <div className="border-t border-white/10 pt-8">
                <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-4">Recent Reviews</h3>
                <div className="space-y-4">
                  {product.reviews.map((review, i) => (
                    <div key={i} className="bg-white/5 p-4 rounded-xl">
                      <div className="flex justify-between mb-2">
                        <span className="font-bold text-sm">{review.name}</span>
                        <div className="flex text-neon-orange">
                          {[...Array(5)].map((_, k) => (
                            <Star
                              key={k}
                              size={12}
                              fill={k < review.rating ? 'currentColor' : 'none'}
                              className={k >= review.rating ? 'text-white/10' : ''}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-white/60">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}