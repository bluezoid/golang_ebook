'use client';

import { motion } from 'framer-motion';
import { useRef } from 'react';
import { useInView } from 'framer-motion';
import { Download, ArrowRight } from 'lucide-react';
import type { ProductData } from './DeepDiveIntoGoPage';

interface CTASectionProps {
  onBuyClick: () => void;
  product: ProductData;
}

export default function CTASection({ onBuyClick, product }: CTASectionProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section className="relative bg-zinc-950 py-28 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-225 h-100 bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:80px_80px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-8 text-center">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="flex flex-col gap-8 items-center"
        >
          <div className="flex flex-col gap-5">
            <span className="text-xs font-medium text-blue-400 uppercase tracking-widest">Get Started Today</span>
            <h2 className="text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.05]">
              Stop watching tutorials.
              <br />
              <span className="bg-linear-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Start shipping Go.
              </span>
            </h2>
            <p className="text-zinc-400 text-lg leading-relaxed max-w-xl mx-auto">
              The gap between knowing Go syntax and building production-grade systems is what this ebook closes. Join hundreds of engineers who made the leap.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <button
              onClick={onBuyClick}
              className="group flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-base transition-all duration-200 shadow-xl shadow-blue-600/30 hover:shadow-blue-500/35 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Download className="w-5 h-5" />
              Get the Ebook — ₹{product.currentPrice}
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
            </button>
            <p className="text-sm text-zinc-600">One-time · Instant delivery · Lifetime access</p>
          </div>

          {/* Social proof mini bar */}
          <div className="flex items-center gap-6 flex-wrap justify-center pt-4">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {['AM', 'PR', 'RS', 'KV', 'NI'].map((initials, i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded-full border-2 border-zinc-950 bg-linear-to-br from-zinc-700 to-zinc-800 flex items-center justify-center"
                  >
                    <span className="text-[8px] font-bold text-zinc-300">{initials}</span>
                  </div>
                ))}
              </div>
              <span className="text-sm text-zinc-500">500+ engineers reading</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-zinc-500">
              <span className="text-amber-400">★★★★★</span>
              <span>5.0 rating</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
