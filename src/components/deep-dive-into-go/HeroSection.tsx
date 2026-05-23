'use client';

import { motion, type Variants } from 'framer-motion';
import { BookOpen, Download, Shield, Zap, Star, ArrowRight, Eye, Code2, Users } from 'lucide-react';
import Image from 'next/image';
import bookCover from '../../../public/book-cover.jpg';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1 },
  }),
};

const trustItems = [
  { icon: Code2, label: '315 Runnable Programs' },
  { icon: BookOpen, label: '102 Chapters · 7 Parts' },
  { icon: Zap, label: 'Go 1.22+ · 2025 Edition' },
  { icon: Shield, label: 'Lifetime Access' },
  { icon: Users, label: '10 Capstone Projects' },
  { icon: Star, label: 'Interview Q&A Appendix' },
];

interface HeroSectionProps {
  onBuyClick: () => void;
  onPreviewClick: () => void;
}

export default function HeroSection({ onBuyClick, onPreviewClick }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-zinc-950">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-225 h-125 bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-125 h-100 bg-indigo-500/8 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-size-[64px_64px]" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8 py-28 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left — copy */}
          <div className="flex flex-col gap-8">
            <motion.div
              custom={0}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-medium w-fit"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              First Edition — 2025 · Go 1.22+
            </motion.div>

            <div className="flex flex-col gap-4">
              <motion.h1
                custom={1}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-white leading-[1.05]"
              >
                Deep Dive
                <br />
                <span className="bg-linear-to-r from-blue-400 via-indigo-400 to-blue-300 bg-clip-text text-transparent">
                  Into Go
                </span>
              </motion.h1>

              <motion.p
                custom={2}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="text-lg text-zinc-400 font-medium max-w-lg leading-relaxed"
              >
                Building Production-Ready Systems. A comprehensive Golang engineering handbook covering 102 chapters, 10 capstone projects, and 315 runnable programs.
              </motion.p>
            </div>

            <motion.p
              custom={3}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="text-sm text-zinc-500 leading-7 max-w-md"
            >
              From zero to production-grade distributed systems. Master goroutines, channels, REST APIs, PostgreSQL, MongoDB, Redis, Docker, microservices architecture, and real-world interview preparation — with 300+ interview Q&amp;A and a Go Spec appendix.
            </motion.p>

            {/* Reading paths */}
            <motion.div
              custom={3.5}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="flex flex-wrap gap-2"
            >
              {[
                { label: 'Linear Path', sub: '4–6 months', color: 'text-blue-400 border-blue-500/30 bg-blue-500/8' },
                { label: 'Bridge Path', sub: '4–6 weeks', color: 'text-violet-400 border-violet-500/30 bg-violet-500/8' },
                { label: 'Interview Path', sub: '2–3 weeks', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/8' },
              ].map((p) => (
                <div key={p.label} className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium ${p.color}`}>
                  <span>{p.label}</span>
                  <span className="opacity-60">·</span>
                  <span className="opacity-60">{p.sub}</span>
                </div>
              ))}
            </motion.div>

            {/* CTA buttons */}
            <motion.div
              custom={4}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="flex flex-col sm:flex-row gap-3"
            >
              <button
                onClick={onBuyClick}
                className="group flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-blue-600/25 hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Download className="w-4 h-4" />
                Buy Now — ₹149
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>

              <button
                onClick={onPreviewClick}
                className="group flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl border border-zinc-700 hover:border-zinc-500 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-semibold text-sm transition-all duration-200"
              >
                <Eye className="w-4 h-4" />
                Preview Book
              </button>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              custom={5}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="flex flex-wrap gap-x-5 gap-y-2.5"
            >
              {trustItems.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-xs text-zinc-500">
                  <Icon className="w-3.5 h-3.5 text-blue-400" />
                  {label}
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — ebook cover + pricing card */}
          <div className="flex flex-col items-center gap-8">
            <motion.div
              initial={{ opacity: 0, y: 32, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3, ease: 'easeInOut' }}
              className="relative"
            >
              {/* Book cover */}
              <div className="relative w-72 lg:w-80">
                {/* Glow */}
                <div className="absolute inset-0 rounded-2xl bg-blue-500/20 blur-3xl scale-110 pointer-events-none" />

                {/* Cover image — static import so Next.js optimizer can read the file */}
                <div className="relative rounded-2xl overflow-hidden border border-white/12 shadow-2xl shadow-black/70">
                  <Image
                    src={bookCover}
                    alt="Deep Dive Into Go — book cover"
                    loading="eager"
                    fetchPriority="high"
                    preload
                    className="w-full h-auto object-cover"
                  />
                </div>

                {/* Price badge */}
                <div className="absolute -top-3 -right-3 bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg shadow-blue-600/30">
                  ₹149
                </div>
              </div>
            </motion.div>

            {/* Compact pricing card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="w-full max-w-sm rounded-2xl border border-white/8 bg-white/3 backdrop-blur-sm p-6 flex flex-col gap-5"
            >
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white">₹149</span>
                <span className="text-zinc-500 text-sm line-through">₹999</span>
                <span className="ml-auto text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">85% OFF</span>
              </div>

              <ul className="flex flex-col gap-2.5">
                {[
                  'Instant PDF delivery to your email',
                  'Lifetime access — no expiry',
                  '100-page free sample before buying',
                  '102 chapters · 7 structured parts',
                  '10 real-world capstone projects',
                  '315 runnable Go 1.22+ programs',
                  '300+ interview Q&A appendix',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-zinc-400">
                    <span className="w-4 h-4 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center shrink-0">
                      <svg className="w-2.5 h-2.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>

              <button
                onClick={onBuyClick}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-blue-600/20 hover:shadow-blue-500/25"
              >
                <Download className="w-4 h-4" />
                Buy Now — ₹149
              </button>

              <p className="text-center text-xs text-zinc-600">Secure checkout · One-time payment · No subscription</p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Sticky mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden border-t border-zinc-800 bg-zinc-950/90 backdrop-blur-md px-4 py-3 flex gap-3">
        <button
          onClick={onPreviewClick}
          className="flex-1 py-3 rounded-xl border border-zinc-700 text-zinc-300 text-sm font-semibold"
        >
          Preview Book
        </button>
        <button
          onClick={onBuyClick}
          className="flex-2 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold shadow-lg shadow-blue-600/20"
        >
          Buy Now — ₹149
        </button>
      </div>
    </section>
  );
}
