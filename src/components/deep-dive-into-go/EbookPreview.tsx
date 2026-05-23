'use client';

import { motion, type Variants } from 'framer-motion';
import { useRef } from 'react';
import { useInView } from 'framer-motion';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

// All 7 parts with actual chapter counts and topics from the PDF
const parts = [
  {
    part: 'Part I',
    title: 'Foundations',
    chapters: 15,
    color: 'from-blue-500/20 to-blue-600/5',
    accent: 'bg-blue-500',
    dot: 'text-blue-400',
    topics: [
      'Go philosophy & toolchain setup',
      'Variables, types & zero values',
      'Control flow & functions',
      'Arrays, slices & maps',
      'Error handling patterns',
    ],
  },
  {
    part: 'Part II',
    title: 'Core Language',
    chapters: 16,
    color: 'from-indigo-500/20 to-indigo-600/5',
    accent: 'bg-indigo-500',
    dot: 'text-indigo-400',
    topics: [
      'Structs, methods & embedding',
      'Interfaces & composition',
      'Generics (Go 1.18+)',
      'Pointers & memory model',
      'Packages & modules',
    ],
  },
  {
    part: 'Part III',
    title: 'Designing Software in Go',
    chapters: 14,
    color: 'from-violet-500/20 to-violet-600/5',
    accent: 'bg-violet-500',
    dot: 'text-violet-400',
    topics: [
      'Clean architecture patterns',
      'Dependency injection',
      'Domain-driven design',
      'Testing strategies',
      'Code organization at scale',
    ],
  },
  {
    part: 'Part IV',
    title: 'Concurrency & Systems',
    chapters: 18,
    color: 'from-cyan-500/20 to-cyan-600/5',
    accent: 'bg-cyan-500',
    dot: 'text-cyan-400',
    topics: [
      'Goroutines internals',
      'Channels & select',
      'sync package deep dive',
      'Context & cancellation',
      'Race conditions & detection',
    ],
  },
  {
    part: 'Part V',
    title: 'Building Backends',
    chapters: 17,
    color: 'from-emerald-500/20 to-emerald-600/5',
    accent: 'bg-emerald-500',
    dot: 'text-emerald-400',
    topics: [
      'HTTP server & routing',
      'REST API design',
      'JWT authentication',
      'PostgreSQL & MongoDB',
      'Redis caching patterns',
    ],
  },
  {
    part: 'Part VI',
    title: 'Production Engineering',
    chapters: 14,
    color: 'from-orange-500/20 to-orange-600/5',
    accent: 'bg-orange-500',
    dot: 'text-orange-400',
    topics: [
      'Docker & containers',
      'Observability & tracing',
      'gRPC & microservices',
      'CI/CD pipelines',
      'Performance profiling',
    ],
  },
  {
    part: 'Part VII',
    title: 'Capstone Projects',
    chapters: 8,
    color: 'from-rose-500/20 to-rose-600/5',
    accent: 'bg-rose-500',
    dot: 'text-rose-400',
    topics: [
      '10 production-grade projects',
      'URL Shortener & Auth Service',
      'Real-Time Chat & Job Queue',
      'API Gateway & File Upload',
      'Distributed Task Scheduler',
    ],
  },
];

const roadmapSteps = [
  { label: 'Foundations', desc: 'Types, syntax, tools' },
  { label: 'Core Lang', desc: 'Structs, interfaces, generics' },
  { label: 'Design', desc: 'Clean arch, DDD, testing' },
  { label: 'Concurrency', desc: 'Goroutines, channels, sync' },
  { label: 'Backends', desc: 'HTTP, REST, databases' },
  { label: 'Production', desc: 'Docker, gRPC, observability' },
  { label: 'Capstones', desc: '10 real-world projects' },
];

function PartCard({ part, index }: { part: typeof parts[0]; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={fadeUp}
      transition={{ delay: index * 0.06 }}
      className={`relative rounded-2xl border border-white/8 bg-linear-to-br ${part.color} p-6 flex flex-col gap-4 hover:border-white/15 transition-all duration-300 group`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-zinc-500 uppercase tracking-widest">{part.part}</span>
          <h3 className="text-base font-semibold text-white">{part.title}</h3>
          <span className={`text-xs ${part.dot} font-medium`}>{part.chapters} chapters</span>
        </div>
        <div className={`w-2 h-2 rounded-full ${part.accent} shrink-0 mt-1.5`} />
      </div>

      <ul className="flex flex-col gap-1.5">
        {part.topics.map((topic) => (
          <li key={topic} className="flex items-center gap-2 text-sm text-zinc-400">
            <span className="w-1 h-1 rounded-full bg-zinc-600 shrink-0" />
            {topic}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

export default function EbookPreview() {
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, margin: '-60px' });

  return (
    <section className="relative bg-zinc-950 py-28 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/4 w-150 h-100 bg-blue-600/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 flex flex-col gap-16">

        {/* Header */}
        <motion.div
          ref={headerRef}
          initial="hidden"
          animate={headerInView ? 'visible' : 'hidden'}
          variants={fadeUp}
          className="flex flex-col gap-4 max-w-2xl"
        >
          <span className="text-xs font-medium text-blue-400 uppercase tracking-widest">What&apos;s Inside</span>
          <h2 className="text-4xl lg:text-5xl font-bold text-white tracking-tight">
            A structured path from
            <br />
            <span className="text-zinc-500">zero to production</span>
          </h2>
          <p className="text-zinc-400 leading-relaxed text-base">
            102 chapters across 7 parts — from Go syntax to distributed systems — with 10 end-to-end capstone projects and 315 runnable programs that you can run locally.
          </p>
        </motion.div>

        {/* Roadmap — grid of steps */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {roadmapSteps.map((step, i) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="relative flex flex-col items-center gap-2 p-4 rounded-2xl border border-white/8 bg-zinc-900/60 text-center group hover:border-blue-500/30 transition-colors duration-300"
            >
              <div className="w-9 h-9 rounded-xl border-2 border-blue-500/60 bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                <span className="text-blue-400 text-xs font-bold">{i + 1}</span>
              </div>
              <span className="text-white text-xs font-semibold leading-tight">{step.label}</span>
              <span className="text-zinc-600 text-[10px] leading-tight">{step.desc}</span>
            </motion.div>
          ))}
        </div>

        {/* Part grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {parts.map((part, i) => (
            <PartCard key={part.part} part={part} index={i} />
          ))}

          {/* Stats card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="rounded-2xl border border-dashed border-white/10 p-6 flex flex-col items-center justify-center gap-4 text-center"
          >
            <div className="flex flex-col gap-1">
              <span className="text-4xl font-bold text-white">102</span>
              <span className="text-zinc-500 text-xs">chapters</span>
            </div>
            <div className="h-px w-8 bg-blue-500/40 mx-auto" />
            <div className="grid grid-cols-2 gap-3 w-full">
              {[
                { n: '315', label: 'programs' },
                { n: '10', label: 'projects' },
                { n: '300+', label: 'interview Q&A' },
                { n: '7', label: 'parts' },
              ].map(({ n, label }) => (
                <div key={label} className="flex flex-col items-center">
                  <span className="text-lg font-bold text-white">{n}</span>
                  <span className="text-zinc-600 text-[10px]">{label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
