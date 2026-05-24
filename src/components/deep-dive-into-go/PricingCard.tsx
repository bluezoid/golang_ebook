'use client';

import { motion } from 'framer-motion';
import { useRef } from 'react';
import { useInView } from 'framer-motion';
import { Download, Shield, RefreshCcw, Mail, FileText, Clock, Infinity } from 'lucide-react';
import type { ProductData } from './DeepDiveIntoGoPage';

const features = [
  { icon: FileText, label: 'Instant PDF delivery to your email' },
  { icon: Infinity, label: 'Lifetime access — no expiry' },
  { icon: RefreshCcw, label: 'Free future edition updates' },
  { icon: Clock, label: '102 chapters · 315 runnable programs' },
  { icon: Mail, label: 'Email support included' },
  { icon: Shield, label: 'Secure one-time payment' },
];

interface PricingCardProps {
  onBuyClick: () => void;
  product: ProductData;
}

export default function PricingCard({ onBuyClick, product }: PricingCardProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section id="pricing" className="relative bg-zinc-950 py-28 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-175 h-100 bg-blue-600/8 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 flex flex-col gap-10 items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-3 text-center max-w-xl"
        >
          <span className="text-xs font-medium text-blue-400 uppercase tracking-widest">Pricing</span>
          <h2 className="text-4xl lg:text-5xl font-bold text-white tracking-tight">
            One-time. Forever yours.
          </h2>
          <p className="text-zinc-400">No subscriptions. No recurring fees. Pay once, own it permanently.</p>
        </motion.div>

        {/* Card */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="relative w-full max-w-lg"
        >
          {/* Glow ring */}
          <div className="absolute -inset-px rounded-3xl bg-linear-to-br from-blue-500/30 via-indigo-500/20 to-transparent blur-sm pointer-events-none" />

          <div className="relative rounded-3xl border border-white/10 bg-zinc-900/80 backdrop-blur-sm overflow-hidden">
            {/* Top accent line */}
            <div className="h-px bg-gradient-to-r from-transparent via-blue-500/60 to-transparent" />

            <div className="p-8 flex flex-col gap-7">
              {/* Badge + label */}
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{product.title}</span>
                  <span className="text-sm font-semibold text-white">Complete Ebook</span>
                </div>
                {product.discountLabel && (
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-3 py-1 rounded-full">
                    {product.discountLabel}
                  </span>
                )}
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-6xl font-bold text-white tracking-tight">₹{product.currentPrice}</span>
                <div className="flex flex-col">
                  <span className="text-zinc-500 text-lg line-through">₹{product.originalPrice}</span>
                  {product.discountPercent > 0 && (
                    <span className="text-emerald-400 text-xs font-semibold">{product.discountPercent}% OFF</span>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-white/6" />

              {/* Feature list */}
              <ul className="flex flex-col gap-3">
                {features.map(({ icon: Icon, label }) => (
                  <li key={label} className="flex items-center gap-3 text-sm text-zinc-300">
                    <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                      <Icon className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                    {label}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                onClick={onBuyClick}
                className="group w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-base transition-all duration-200 shadow-xl shadow-blue-600/25 hover:shadow-blue-500/30 hover:scale-[1.01] active:scale-[0.99]"
              >
                <Download className="w-5 h-5" />
                {product.ctaPrimary} — ₹{product.currentPrice}
              </button>

              {/* Trust */}
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <div className="flex items-center gap-1.5 text-xs text-zinc-600">
                  <Shield className="w-3.5 h-3.5" />
                  Secure checkout
                </div>
                <span className="text-zinc-800">·</span>
                <span className="text-xs text-zinc-600">One-time payment</span>
                <span className="text-zinc-800">·</span>
                <span className="text-xs text-zinc-600">Instant delivery</span>
              </div>

              {/* Payment logos */}
              <div className="flex items-center justify-center gap-3 pt-1">
                {['UPI', 'Cards', 'Net Banking', 'Wallets'].map((method) => (
                  <span
                    key={method}
                    className="text-[10px] font-medium text-zinc-600 border border-zinc-800 px-2 py-1 rounded-md"
                  >
                    {method}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
