'use client';

import { motion } from 'framer-motion';
import { XCircle, ArrowLeft, Download } from 'lucide-react';
import Link from 'next/link';

export default function CancelledPage() {
  return (
    <main className="min-h-screen bg-zinc-950 flex items-center justify-center px-6 py-20">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-175 h-100 bg-zinc-800/20 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="rounded-3xl border border-white/8 bg-zinc-900/80 overflow-hidden">
          <div className="h-px bg-linear-to-r from-transparent via-zinc-600/60 to-transparent" />
          <div className="p-8 flex flex-col gap-6 items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-zinc-800 border border-white/8 flex items-center justify-center">
              <XCircle className="w-8 h-8 text-zinc-400" />
            </div>

            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-bold text-white">Payment Cancelled</h1>
              <p className="text-zinc-400 text-sm leading-relaxed">
                No worries — no charge was made. You can go back and try again whenever you&apos;re ready.
              </p>
            </div>

            <div className="w-full rounded-2xl bg-zinc-950/60 border border-white/6 p-5 flex flex-col gap-2 text-left">
              <p className="text-sm font-semibold text-white">Deep Dive Into Go</p>
              <p className="text-xs text-zinc-500">Still available at launch price — ₹149 (was ₹999)</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Link
                href="/products/deep-dive-into-go"
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white text-sm font-semibold transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to page
              </Link>
              <Link
                href="/products/deep-dive-into-go#pricing"
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors shadow-lg shadow-blue-600/20"
              >
                <Download className="w-4 h-4" />
                Try again
              </Link>
            </div>

            <p className="text-xs text-zinc-700">
              Need help? Email{' '}
              <a href="mailto:support@bluezoid.in" className="text-zinc-500 hover:text-zinc-300 transition-colors">
                support@bluezoid.in
              </a>
            </p>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
