'use client';

import { motion } from 'framer-motion';
import { useRef } from 'react';
import { useInView } from 'framer-motion';
import { Eye, FileText, BookOpen } from 'lucide-react';
import Image from 'next/image';
import bookCover from '../../../public/book-cover.jpg';

interface PDFPreviewProps {
  onPreviewClick: () => void;
}

function BookCover() {
  return (
    <div className="relative w-64 lg:w-72">
      {/* Glow */}
      <div className="absolute inset-0 rounded-2xl bg-blue-500/25 blur-3xl scale-110 pointer-events-none" />

      {/* Shadow stack (depth effect) */}
      <div className="absolute top-2 left-2 w-full h-full rounded-2xl bg-zinc-800 border border-white/5" />
      <div className="absolute top-1 left-1 w-full h-full rounded-2xl bg-zinc-850 border border-white/5" />

      {/* Cover image */}
      <div className="relative rounded-2xl overflow-hidden border border-white/12 shadow-2xl shadow-black/70">
        <Image
          src={bookCover}
          alt="Deep Dive Into Go — book cover"
          className="w-full h-auto object-cover"
        />
      </div>

      {/* Price badge */}
      <div className="absolute -top-3 -right-3 bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg shadow-blue-600/40 border border-blue-500">
        ₹149
      </div>

      {/* Sample badge */}
      <div className="absolute -bottom-3 -left-3 bg-zinc-900 border border-white/10 text-zinc-400 text-[10px] font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
        <BookOpen className="w-3 h-3 text-blue-400" />
        100-page free sample
      </div>
    </div>
  );
}

function ChapterSnippet({ chapter, title, lines, index }: {
  chapter: string; title: string; lines: number[]; index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="rounded-xl border border-white/8 bg-zinc-900/80 overflow-hidden"
    >
      <div className="px-4 py-3 border-b border-white/6 flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">{chapter}</span>
          <span className="text-xs font-semibold text-white leading-tight">{title}</span>
        </div>
      </div>
      <div className="p-4 flex flex-col gap-2">
        {lines.map((len, i) => (
          <div key={i} className="h-1.5 rounded-full bg-zinc-800" style={{ width: `${len}%` }} />
        ))}
        <div className="mt-1 rounded-lg bg-zinc-950 p-3 flex flex-col gap-1.5 border border-white/5">
          <div className="flex gap-1.5 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500/60" />
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/60" />
            <div className="w-1.5 h-1.5 rounded-full bg-green-500/60" />
          </div>
          {[65, 88, 55, 78, 45, 70].map((w, i) => (
            <div key={i} className="h-1 rounded-full bg-zinc-800" style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function PDFPreview({ onPreviewClick }: PDFPreviewProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section className="relative bg-zinc-950 py-28 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 -translate-y-1/2 right-0 w-175 h-175 bg-blue-600/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left — copy */}
          <motion.div
            ref={ref}
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-8"
          >
            <div className="flex flex-col gap-4">
              <span className="text-xs font-medium text-blue-400 uppercase tracking-widest">Free Preview</span>
              <h2 className="text-4xl lg:text-5xl font-bold text-white tracking-tight">
                Read 100 pages
                <br />
                <span className="text-zinc-500">before you buy</span>
              </h2>
              <p className="text-zinc-400 leading-relaxed">
                The free sample includes the complete table of contents, all of Chapter 1 in full, and chapter previews from all 7 parts. No registration. No email.
              </p>
            </div>

            <ul className="flex flex-col gap-3">
              {[
                'Complete table of contents — all 102 chapters',
                'Full Chapter 1: Why Go? Philosophy & Toolchain',
                'Chapter previews from all 7 parts',
                '315 runnable programs sample included',
                'No email or registration required',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-zinc-400">
                  <span className="w-5 h-5 rounded-full bg-blue-500/15 border border-blue-500/30 flex items-center justify-center shrink-0">
                    <svg className="w-3 h-3 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row gap-3 items-start">
              <button
                onClick={onPreviewClick}
                className="group flex items-center gap-2.5 px-6 py-3 rounded-xl border border-zinc-700 hover:border-blue-500/50 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-semibold text-sm transition-all duration-200"
              >
                <Eye className="w-4 h-4" />
                Preview Book
              </button>
              <div className="flex items-center gap-2 text-xs text-zinc-600 px-1 self-center">
                <FileText className="w-3.5 h-3.5" />
                2.7 MB · 100 pages
              </div>
            </div>
          </motion.div>

          {/* Right — book cover + chapter snippets */}
          <div className="flex items-center justify-center lg:justify-end gap-8">
            {/* Book cover */}
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <BookCover />
            </motion.div>

            {/* Chapter snippets stacked */}
            <div className="hidden sm:flex flex-col gap-3">
              {[
                { chapter: 'Chapter 1', title: 'Why Go? Philosophy & Toolchain', lines: [100, 75, 90, 60, 82] },
                { chapter: 'Chapter 19', title: 'Goroutines & the Scheduler', lines: [85, 70, 95, 55, 78] },
                { chapter: 'Chapter 47', title: 'REST APIs with net/http', lines: [90, 65, 80, 88, 50] },
              ].map((p, i) => (
                <ChapterSnippet key={p.chapter} {...p} index={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
