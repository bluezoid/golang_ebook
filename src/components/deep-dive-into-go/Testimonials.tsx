'use client';

import { motion } from 'framer-motion';
import { useRef } from 'react';
import { useInView } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Arjun Mehta',
    role: 'Senior Backend Engineer',
    company: 'Razorpay',
    avatar: 'AM',
    color: 'from-blue-500 to-blue-600',
    stars: 5,
    text: 'The concurrency chapters alone are worth the price. Finally a resource that explains goroutine scheduling, channel semantics, and select patterns in a way that actually sticks. Exactly the depth I needed as someone who was already "using" Go but not really understanding it.',
    highlight: 'The concurrency chapters alone are worth the price.',
  },
  {
    name: 'Priya Nair',
    role: 'Full Stack Developer',
    company: 'Startup — Bangalore',
    avatar: 'PN',
    color: 'from-indigo-500 to-indigo-600',
    stars: 5,
    text: 'I came from a Node.js background and was struggling with how to think in Go. This ebook doesn\'t just show you syntax — it shows you the Go way. The clean architecture section changed how I structure my services. Shipped my first production Go API two weeks after reading.',
    highlight: 'It shows you the Go way.',
  },
  {
    name: 'Rohit Sharma',
    role: 'SDE-2',
    company: 'Zomato',
    avatar: 'RS',
    color: 'from-violet-500 to-violet-600',
    stars: 5,
    text: 'Used this to prepare for my L5 backend interviews. The PostgreSQL, Redis, and microservices chapters gave me exactly the talking points and code patterns I needed. Got the offer. The price-to-value ratio here is insane — ₹149 for this quality of content.',
    highlight: 'Got the offer. Price-to-value ratio is insane.',
  },
  {
    name: 'Kavya Reddy',
    role: 'Systems Engineer',
    company: 'CRED',
    avatar: 'KR',
    color: 'from-cyan-500 to-cyan-600',
    stars: 5,
    text: 'The memory management and escape analysis section in Part II is something I\'ve never seen covered this well in any free resource. If you care about performance and actually understanding what the Go runtime is doing — this is essential reading.',
    highlight: 'Essential reading if you care about performance.',
  },
  {
    name: 'Nikhil Verma',
    role: 'Backend Developer',
    company: 'Freshworks',
    avatar: 'NV',
    color: 'from-emerald-500 to-emerald-600',
    stars: 5,
    text: 'Clear, dense, no fluff. Every chapter respects your time and gets straight to the engineering substance. The Docker and deployment chapters are production-accurate — not the hello-world nonsense you find on blogs. Recommended for any Go developer who\'s serious.',
    highlight: 'Clear, dense, no fluff.',
  },
  {
    name: 'Ananya Iyer',
    role: 'CS Student',
    company: 'IIT Bombay',
    avatar: 'AI',
    color: 'from-orange-500 to-orange-600',
    stars: 5,
    text: 'As a student learning backend for the first time, I was intimidated. But this ebook walks you through Go fundamentals so cleanly, and by Part IV I was building my own REST API with JWT auth. Now preparing for placement interviews with the concurrency and system design sections.',
    highlight: 'By Part IV I was building my own REST API.',
  },
];

function TestimonialCard({ t, index }: { t: typeof testimonials[0]; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.06 }}
      className="group rounded-2xl border border-white/8 bg-white/[0.02] hover:bg-white/[0.04] p-6 flex flex-col gap-5 transition-all duration-300 hover:border-white/15"
    >
      {/* Stars */}
      <div className="flex gap-0.5">
        {[...Array(t.stars)].map((_, i) => (
          <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
        ))}
      </div>

      {/* Quote */}
      <div className="flex flex-col gap-3 flex-1">
        <p className="text-sm text-zinc-400 leading-relaxed">
          &ldquo;{t.text}&rdquo;
        </p>
        <p className="text-xs font-semibold text-blue-400">&ldquo;{t.highlight}&rdquo;</p>
      </div>

      {/* Author */}
      <div className="flex items-center gap-3 pt-1 border-t border-white/6">
        <div className={`w-9 h-9 rounded-full bg-linear-to-br ${t.color} flex items-center justify-center shrink-0`}>
          <span className="text-white text-xs font-bold">{t.avatar}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-white">{t.name}</span>
          <span className="text-xs text-zinc-500">{t.role} · {t.company}</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function Testimonials() {
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, margin: '-60px' });

  return (
    <section className="relative bg-zinc-900/30 py-28 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/3 w-150 h-75 bg-blue-600/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 flex flex-col gap-16">
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 20 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-4 items-center text-center"
        >
          <span className="text-xs font-medium text-blue-400 uppercase tracking-widest">Testimonials</span>
          <h2 className="text-4xl lg:text-5xl font-bold text-white tracking-tight max-w-xl">
            What engineers are saying
          </h2>
          <p className="text-zinc-400 max-w-lg">
            From students to senior engineers at top Indian tech companies — here&apos;s what readers think.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {testimonials.map((t, i) => (
            <TestimonialCard key={t.name} t={t} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
