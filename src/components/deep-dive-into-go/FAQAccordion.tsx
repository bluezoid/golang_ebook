'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Plus } from 'lucide-react';

const faqs = [
  {
    q: 'Is this ebook beginner friendly?',
    a: 'Yes. The ebook starts from Go fundamentals — syntax, types, and tooling — and progressively builds up to advanced topics like concurrency, distributed systems, and production deployment. No prior Go knowledge is required.',
  },
  {
    q: 'Is this a physical book?',
    a: 'No. This is a premium digital PDF ebook. You receive it instantly via email upon successful payment. No shipping, no waiting — download it immediately and start reading.',
  },
  {
    q: 'How do I receive the ebook after purchase?',
    a: 'After completing your payment, the PDF is delivered instantly to your registered email address. You\'ll receive a download link within seconds. Make sure to check your spam folder if you don\'t see it.',
  },
  {
    q: 'How long do I get access?',
    a: 'Lifetime. Once you purchase, the ebook is yours permanently. There are no expiry dates, no subscriptions, and no recurring fees. You can re-download it anytime from your email.',
  },
  {
    q: 'Are future updates included?',
    a: 'Yes. The Go ecosystem evolves — when we update the ebook for new language versions, patterns, or best practices, you receive the updated version free of charge at your purchase email.',
  },
  {
    q: 'Can I read this on mobile or tablet?',
    a: 'Absolutely. The PDF is optimized for readability on any device — laptops, tablets (iPad, Android), e-readers, and mobile phones. All code examples are formatted for comfortable reading on smaller screens.',
  },
  {
    q: 'What payment methods are supported?',
    a: 'We support all major payment methods via Cashfree: UPI (GPay, PhonePe, Paytm), credit/debit cards (Visa, Mastercard, Rupay), net banking, and popular mobile wallets.',
  },
  {
    q: 'Do you provide refunds?',
    a: 'Due to the instant-digital nature of this product, all sales are final. However, if you experience a technical issue with delivery or download, contact us at support@bluezoid.in and we\'ll resolve it promptly.',
  },
];

function FAQItem({ faq, index }: { faq: typeof faqs[0]; index: number }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 12 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="border-b border-white/8 last:border-0"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 py-5 text-left group"
        aria-expanded={open}
      >
        <span className="text-sm lg:text-base font-medium text-zinc-200 group-hover:text-white transition-colors">
          {faq.q}
        </span>
        <span className={`shrink-0 w-7 h-7 rounded-full border border-white/15 bg-white/5 flex items-center justify-center transition-all duration-300 ${open ? 'bg-blue-500/20 border-blue-500/40 rotate-45' : 'group-hover:border-white/25'}`}>
          <Plus className={`w-3.5 h-3.5 transition-colors duration-200 ${open ? 'text-blue-400' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="text-sm text-zinc-500 leading-relaxed pb-5 pr-10">{faq.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQAccordion() {
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, margin: '-60px' });

  return (
    <section className="relative bg-zinc-950 py-28 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 right-1/4 w-100 h-75 bg-indigo-600/5 rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-[1fr_2fr] gap-16">

          {/* Left — header */}
          <motion.div
            ref={headerRef}
            initial={{ opacity: 0, y: 20 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-4 lg:pt-2"
          >
            <span className="text-xs font-medium text-blue-400 uppercase tracking-widest">FAQ</span>
            <h2 className="text-4xl lg:text-5xl font-bold text-white tracking-tight">
              Common
              <br />
              questions
            </h2>
            <p className="text-zinc-500 leading-relaxed text-sm">
              Everything you need to know before purchasing. Still have questions? Email{' '}
              <a href="mailto:support@bluezoid.in" className="text-blue-400 hover:underline">
                support@bluezoid.in
              </a>
            </p>
          </motion.div>

          {/* Right — accordion */}
          <div className="flex flex-col">
            {faqs.map((faq, i) => (
              <FAQItem key={faq.q} faq={faq} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
