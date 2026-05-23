'use client';

import { motion, type Variants } from 'framer-motion';
import { useRef } from 'react';
import { useInView } from 'framer-motion';
import {
  Code2, Layers, Cpu, Database, Package, TestTube2, GitBranch, BookMarked,
} from 'lucide-react';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const features = [
  {
    icon: Code2,
    title: '315 Runnable Programs',
    desc: 'Every concept is backed by a complete, working Go program you can run locally — from Hello World to distributed task schedulers.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
  },
  {
    icon: Layers,
    title: '3 Reading Paths',
    desc: 'Linear path (4–6 months), Bridge path for experienced engineers (4–6 weeks), and Interview-prep path (2–3 weeks). Read your way.',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10 border-indigo-500/20',
  },
  {
    icon: Cpu,
    title: 'Concurrency Internals',
    desc: 'Deep dive into the Go scheduler, goroutine internals, channel mechanics, sync primitives, and real-world concurrency patterns used in production.',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10 border-violet-500/20',
  },
  {
    icon: Database,
    title: 'Real Database Integration',
    desc: 'PostgreSQL with sqlx, MongoDB with the official driver, Redis caching — complete with query optimization, connection pooling, and migration patterns.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10 border-cyan-500/20',
  },
  {
    icon: Package,
    title: '10 Capstone Projects',
    desc: 'URL Shortener, Auth Service, E-commerce Backend, Real-Time Chat, Notification Service, Job Queue, File Upload Service, API Gateway, Task Scheduler, Microservices Platform.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
  },
  {
    icon: TestTube2,
    title: 'Testing from Chapter 1',
    desc: 'Unit tests, table-driven tests, benchmarks, race detection, integration tests, and mocking strategies — testing is a first-class citizen throughout.',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10 border-yellow-500/20',
  },
  {
    icon: GitBranch,
    title: 'Generics & Modern Go',
    desc: 'Complete coverage of Go 1.18+ generics, type constraints, type inference, and how to use generics without over-engineering your codebase.',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10 border-orange-500/20',
  },
  {
    icon: BookMarked,
    title: '300+ Interview Q&A',
    desc: 'A dedicated appendix with 300+ Go interview questions and answers covering runtime internals, concurrency, APIs, and system design.',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10 border-rose-500/20',
  },
];

function FeatureCard({ f, index }: { f: typeof features[0]; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={fadeUp}
      transition={{ delay: index * 0.05 }}
      className="relative rounded-2xl border border-white/8 bg-zinc-900/50 p-6 flex flex-col gap-4 hover:border-white/14 transition-colors duration-300"
    >
      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${f.bg}`}>
        <f.icon className={`w-5 h-5 ${f.color}`} />
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-white">{f.title}</h3>
        <p className="text-sm text-zinc-500 leading-relaxed">{f.desc}</p>
      </div>
    </motion.div>
  );
}

export default function EbookFeatures() {
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, margin: '-60px' });

  return (
    <section className="relative bg-zinc-900 py-28 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 right-1/3 w-120 h-80 bg-indigo-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 flex flex-col gap-14">
        <motion.div
          ref={headerRef}
          initial="hidden"
          animate={headerInView ? 'visible' : 'hidden'}
          variants={fadeUp}
          className="flex flex-col gap-4 max-w-2xl"
        >
          <span className="text-xs font-medium text-indigo-400 uppercase tracking-widest">Why This Book</span>
          <h2 className="text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Built for engineers who
            <br />
            <span className="text-zinc-500">ship real code</span>
          </h2>
          <p className="text-zinc-400 leading-relaxed">
            Not another syntax tour. Every chapter is written from production experience — from zero-allocation patterns to distributed system design.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <FeatureCard key={f.title} f={f} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
