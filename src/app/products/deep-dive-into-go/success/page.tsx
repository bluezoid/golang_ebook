'use client';

import { Suspense, useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, Mail, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

type VerifyState = 'verifying' | 'fulfilled' | 'already_fulfilled' | 'pending' | 'error';

function SuccessContent() {
  const params = useSearchParams();
  const router = useRouter();
  const orderId = params.get('order_id');
  const [state, setState] = useState<VerifyState>('verifying');
  const [email, setEmail] = useState('');
  const verified = useRef(false);

  useEffect(() => {
    if (!orderId || verified.current) return;
    verified.current = true;

    fetch('/api/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.status === 'fulfilled') {
          setEmail(data.email ?? '');
          setState('fulfilled');
        } else if (data.status === 'already_fulfilled') {
          setState('already_fulfilled');
        } else if (data.status === 'failed') {
          router.replace(`/products/deep-dive-into-go/cancelled?order_id=${orderId}`);
        } else {
          setState('pending');
        }
      })
      .catch(() => setState('error'));
  }, [orderId, router]);

  return (
    <>
      {state === 'verifying' && (
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold text-white">Verifying your payment…</h1>
            <p className="text-zinc-500 text-sm">This usually takes just a second.</p>
          </div>
        </div>
      )}

      {(state === 'fulfilled' || state === 'already_fulfilled') && (
        <div className="w-full max-w-md rounded-3xl border border-white/8 bg-zinc-900/80 overflow-hidden">
          <div className="h-px bg-linear-to-r from-transparent via-emerald-500/60 to-transparent" />
          <div className="p-8 flex flex-col gap-6 items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-bold text-white">Payment Successful!</h1>
              <p className="text-zinc-400 text-sm leading-relaxed">
                {state === 'already_fulfilled'
                  ? 'Your purchase was already processed. Check your email for the download link.'
                  : `Your eBook is on its way. Check ${email || 'your email'} for the download link — it arrives within a minute.`}
              </p>
            </div>

            <div className="w-full rounded-2xl bg-zinc-950/60 border border-white/6 p-5 flex flex-col gap-3 text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0">
                  <span className="text-white font-bold">Go</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Deep Dive Into Go</p>
                  <p className="text-xs text-zinc-500">102 chapters · 315 programs · First Edition 2025</p>
                </div>
              </div>
              <div className="flex items-start gap-2 text-xs text-zinc-500 mt-1">
                <Mail className="w-3.5 h-3.5 mt-0.5 shrink-0 text-blue-400" />
                <span>Download link sent to your email. Valid for 15 minutes — click promptly.</span>
              </div>
            </div>

            <p className="text-xs text-zinc-600">
              Didn&apos;t receive it? Check spam, or email{' '}
              <a href="mailto:support@bluezoid.in" className="text-blue-400 hover:underline">
                support@bluezoid.in
              </a>{' '}
              with order ID: <span className="font-mono text-zinc-500">{orderId}</span>
            </p>

            <Link
              href="/products/deep-dive-into-go"
              className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to product page
            </Link>
          </div>
        </div>
      )}

      {state === 'pending' && (
        <div className="w-full max-w-md rounded-3xl border border-yellow-500/20 bg-zinc-900/80 p-8 flex flex-col gap-4 items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
          </div>
          <h1 className="text-xl font-bold text-white">Payment is processing</h1>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Your payment is still being confirmed. If money was deducted, you will receive the eBook automatically once confirmed.
          </p>
          <p className="text-xs text-zinc-600">
            Questions?{' '}
            <a href="mailto:support@bluezoid.in" className="text-blue-400 hover:underline">
              support@bluezoid.in
            </a>{' '}
            · Order: <span className="font-mono">{orderId}</span>
          </p>
        </div>
      )}

      {state === 'error' && (
        <div className="w-full max-w-md rounded-3xl border border-red-500/20 bg-zinc-900/80 p-8 flex flex-col gap-4 items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-xl font-bold text-white">Something went wrong</h1>
          <p className="text-zinc-400 text-sm leading-relaxed">
            We couldn&apos;t verify your payment. If money was deducted, please contact us immediately.
          </p>
          <a href="mailto:support@bluezoid.in" className="text-sm text-blue-400 hover:underline">
            support@bluezoid.in
          </a>
        </div>
      )}
    </>
  );
}

export default function SuccessPage() {
  return (
    <main className="min-h-screen bg-zinc-950 flex items-center justify-center px-6 py-20">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-175 h-100 bg-blue-600/8 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md flex items-center justify-center"
      >
        <Suspense
          fallback={
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
              <p className="text-zinc-500 text-sm">Loading…</p>
            </div>
          }
        >
          <SuccessContent />
        </Suspense>
      </motion.div>
    </main>
  );
}
