import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Star, ShoppingCart, Heart } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, MeshDistortMaterial, useGLTF } from '@react-three/drei';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  image: string;
  images?: string[];
  glbUrl?: string;           // ← Add this line
  description: string;
  rating: number;
  reviews?: { name: string; rating: number; comment: string }[];
}
function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} scale={1.5} />;
}
export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const addToCart = useStore((state) => state.addToCart);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then((data: Product[]) => {
        const found = data.find(p => p.id === id);
        if (found) {
          if (!found.images) found.images = [found.image, found.image, found.image];
          setProduct(found);
        }
      });
  }, [id]);

  if (!product) return <div className="min-h-screen flex items-center justify-center text-white">Loading product...</div>;

  return (
    <div className="min-h-screen pt-20 pb-12 bg-[#050505]">
      <div className="max-w-7xl mx-auto px-6">
        <Link to="/" className="flex items-center gap-2 text-white/60 hover:text-white mb-8">
          <ArrowLeft size={20} /> Back to Catalog
        </Link>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left: Images + 3D */}
         {/* Left: Images + 3D Viewer */}
<div className="space-y-6">
  {/* Main 3D / Image Viewer */}
  <div className="aspect-square rounded-3xl overflow-hidden bg-white/5 border border-white/10">
    {product.glbUrl ? (
      // Real uploaded 3D model
      <Canvas camera={{ position: [0, 0, 3] }} className="w-full h-full">
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Model url={product.glbUrl} />
        <OrbitControls enableZoom={true} enablePan={true} />
      </Canvas>
    ) : (
      // Fallback 3D (if no GLB uploaded)
      <Canvas camera={{ position: [0, 0, 3] }} className="w-full h-full">
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <mesh>
          <torusKnotGeometry args={[1, 0.3, 100, 16]} />
          <MeshDistortMaterial color="#00D2FF" distort={0.4} speed={2} />
        </mesh>
        <OrbitControls />
      </Canvas>
    )}
  </div>

  {/* Thumbnails + 3D Button */}
  <div className="flex gap-4">
    {product.images?.map((img, index) => (
      <button
        key={index}
        onClick={() => setSelectedImage(index)}
        className={`flex-1 aspect-square rounded-2xl overflow-hidden border-2 transition-all ${selectedImage === index ? 'border-neon-cyan' : 'border-transparent'}`}
      >
        <img src={img} alt="" className="w-full h-full object-cover" />
      </button>
    ))}
  </div>
</div>

          {/* Right: Details */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="px-4 py-1 rounded-full bg-white/10 text-xs font-bold uppercase tracking-widest">{product.category}</span>
              <div className="flex items-center gap-1 text-neon-orange">
                <Star size={18} fill="currentColor" />
                <span className="font-bold">{product.rating}</span>
              </div>
            </div>

            <h1 className="text-5xl font-black font-display leading-tight mb-6">{product.name}</h1>

            <div className="flex items-baseline gap-4 mb-8">
              <span className="text-4xl font-black font-display text-neon-cyan">Rs. {product.price.toLocaleString()}</span>
              {product.originalPrice && (
                <span className="text-xl text-white/40 line-through">Rs. {product.originalPrice.toLocaleString()}</span>
              )}
            </div>

            <p className="text-white/70 leading-relaxed mb-10">{product.description}</p>

            <div className="flex gap-4 mb-12">
              <button 
                onClick={() => addToCart(product)}
                className="flex-1 neon-button-orange flex items-center justify-center gap-3 py-5 text-lg"
              >
                <ShoppingCart size={24} />
                Add to Cart
              </button>
              <button className="px-8 py-5 rounded-3xl border border-white/20 hover:bg-white/5 transition-colors">
                <Heart size={24} />
              </button>
            </div>

            {/* Reviews */}
            <div>
              <h3 className="text-xl font-black uppercase mb-6">Customer Reviews</h3>
              {product.reviews?.map((review, i) => (
                <div key={i} className="glass-card p-6 mb-4">
                  <div className="flex justify-between mb-3">
                    <div className="font-bold">{review.name}</div>
                    <div className="flex text-neon-orange">
                      {Array(review.rating).fill(0).map((_, k) => <Star key={k} size={16} fill="currentColor" />)}
                    </div>
                  </div>
                  <p className="text-white/70 text-sm">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}