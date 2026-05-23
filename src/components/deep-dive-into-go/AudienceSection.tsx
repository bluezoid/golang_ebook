'use client';

import { motion, type Variants } from 'framer-motion';
import { useRef } from 'react';
import { useInView } from 'framer-motion';
import { GraduationCap, Code2, Briefcase, Repeat2, Rocket, Network, Trophy } from 'lucide-react';

const audiences = [
  {
    icon: GraduationCap,
    title: 'Students & Beginners',
    desc: 'Building your first backend in Go? This handbook takes you from zero syntax knowledge to building real APIs with solid foundations.',
    tags: ['Start from scratch', 'Structured learning'],
    color: 'from-blue-500/15 to-transparent',
    border: 'hover:border-blue-500/30',
  },
  {
    icon: Code2,
    title: 'Backend Developers',
    desc: 'Already building backends in Node, Python, or Java? Level up with Go\'s concurrency model and type system to write faster, safer services.',
    tags: ['Language migration', 'Production patterns'],
    color: 'from-indigo-500/15 to-transparent',
    border: 'hover:border-indigo-500/30',
  },
  {
    icon: Briefcase,
    title: 'Working Engineers',
    desc: 'Mid-level engineers looking to sharpen their Go skills, understand internals, and adopt senior-level architectural patterns.',
    tags: ['Deep internals', 'Architecture patterns'],
    color: 'from-violet-500/15 to-transparent',
    border: 'hover:border-violet-500/30',
  },
  {
    icon: Repeat2,
    title: 'Switching to Go',
    desc: 'Migrating your team or personal stack to Go? Get up to speed with Go-specific idioms, tooling, and ecosystem best practices.',
    tags: ['Idiomatic Go', 'Ecosystem tooling'],
    color: 'from-cyan-500/15 to-transparent',
    border: 'hover:border-cyan-500/30',
  },
  {
    icon: Rocket,
    title: 'Startup Engineers',
    desc: 'Building fast at a startup? Learn how to design Go services that scale without premature complexity — practical and pragmatic.',
    tags: ['Move fast', 'Scalable architecture'],
    color: 'from-emerald-500/15 to-transparent',
    border: 'hover:border-emerald-500/30',
  },
  {
    icon: Network,
    title: 'Systems Design Learners',
    desc: 'Understand how Go powers real distributed systems — microservices, message queues, service meshes, and more.',
    tags: ['Distributed systems', 'Microservices'],
    color: 'from-orange-500/15 to-transparent',
    border: 'hover:border-orange-500/30',
  },
  {
    icon: Trophy,
    title: 'Interview Prep',
    desc: 'Preparing for senior backend or SWE interviews? Go is increasingly preferred — master it with depth that impresses interviewers.',
    tags: ['Interview mastery', 'Senior engineering'],
    color: 'from-pink-500/15 to-transparent',
    border: 'hover:border-pink-500/30',
  },
];

function AudienceCard({ audience, index }: { audience: typeof audiences[0]; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const Icon = audience.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.07 }}
      className={`group rounded-2xl border border-white/8 ${audience.border} bg-linear-to-br ${audience.color} bg-zinc-950 p-6 flex flex-col gap-4 transition-all duration-300`}
    >
      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
        <Icon className="w-5 h-5 text-zinc-300" />
      </div>

      <div className="flex flex-col gap-2 flex-1">
        <h3 className="text-base font-semibold text-white">{audience.title}</h3>
        <p className="text-sm text-zinc-500 leading-relaxed">{audience.desc}</p>
      </div>

      <div className="flex flex-wrap gap-1.5 pt-1">
        {audience.tags.map((tag) => (
          <span key={tag} className="text-[11px] font-medium text-zinc-500 border border-zinc-800 px-2 py-0.5 rounded-full">
            {tag}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

export default function AudienceSection() {
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, margin: '-60px' });

  return (
    <section className="relative bg-zinc-950 py-28 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/3 w-125 h-75 bg-blue-600/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 flex flex-col gap-16">
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 20 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-4 max-w-2xl"
        >
          <span className="text-xs font-medium text-blue-400 uppercase tracking-widest">Who Is This For</span>
          <h2 className="text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Built for engineers
            <br />
            <span className="text-zinc-500">at every stage</span>
          </h2>
          <p className="text-zinc-400 leading-relaxed">
            Whether you&apos;re just starting with Go or architecting distributed systems — this handbook has something that levels you up.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {audiences.map((audience, i) => (
            <AudienceCard key={audience.title} audience={audience} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
