import { motion } from 'motion/react';

export default function ProductSkeleton() {
  return (
    <div className="glass-card p-4 border-white/5">
      <div className="relative aspect-square overflow-hidden rounded-xl mb-4 bg-white/5 animate-pulse" />
      
      <div className="flex justify-between items-start mb-2">
        <div className="h-6 w-2/3 bg-white/10 rounded animate-pulse" />
        <div className="h-4 w-10 bg-white/10 rounded animate-pulse" />
      </div>
      
      <div className="h-3 w-full bg-white/5 rounded mb-2 animate-pulse" />
      <div className="h-3 w-4/5 bg-white/5 rounded mb-4 animate-pulse" />
      
      <div className="flex items-center justify-between">
        <div className="h-8 w-24 bg-white/10 rounded animate-pulse" />
        <div className="h-3 w-16 bg-white/5 rounded animate-pulse" />
      </div>
    </div>
  );
}
