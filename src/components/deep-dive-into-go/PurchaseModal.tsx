'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Shield, Mail, CreditCard, Smartphone, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import bookCover from '../../../public/book-cover.jpg';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { checkoutSchema, type CheckoutFormValues } from '@/lib/validators';
import type { ProductData } from './DeepDiveIntoGoPage';

const PRODUCT_SLUG = 'deep-dive-into-go';

interface PurchaseModalProps {
  open: boolean;
  onClose: () => void;
  product: ProductData;
}

type SubmitState = 'idle' | 'submitting' | 'redirecting' | 'error';

export default function PurchaseModal({ open, onClose, product }: PurchaseModalProps) {
  const firstFieldRef = useRef<HTMLInputElement | null>(null);
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { firstName: '', lastName: '', email: '', phone: '' },
  });

  const firstNameRegister = register('firstName');

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => firstFieldRef.current?.focus(), 150);
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Reset form state when modal closes. setState is deferred so the rule
  // react-hooks/set-state-in-effect is satisfied (not called synchronously).
  useEffect(() => {
    if (!open) {
      const id = setTimeout(() => {
        reset();
        setSubmitState('idle');
        setErrorMsg('');
      }, 0);
      return () => clearTimeout(id);
    }
  }, [open, reset]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const onSubmit = async (data: CheckoutFormValues) => {
    setSubmitState('submitting');
    setErrorMsg('');

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, productSlug: PRODUCT_SLUG }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error ?? 'Something went wrong');
      }

      const { paymentSessionId } = json;
      if (!paymentSessionId) throw new Error('No payment session received');

      setSubmitState('redirecting');

      // Load Cashfree JS SDK dynamically (browser-only)
      // @ts-expect-error — package ships no types, loaded at runtime
      const cashfreeModule = await import('@cashfreepayments/cashfree-js');
      const load = cashfreeModule.load ?? cashfreeModule.default?.load;
      const cashfree = await load({
        mode: process.env.NEXT_PUBLIC_CASHFREE_ENV === 'production' ? 'production' : 'sandbox',
      });

      cashfree.checkout({
        paymentSessionId,
        redirectTarget: '_self',
      });
    } catch (err) {
      setSubmitState('error');
      setErrorMsg(err instanceof Error ? err.message : 'Payment setup failed. Please try again.');
    }
  };

  const inputClass = (hasError: boolean) =>
    `w-full px-4 py-3 rounded-xl bg-zinc-950 border text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-1 transition-all ${
      hasError
        ? 'border-red-500/60 focus:border-red-500/80 focus:ring-red-500/20'
        : 'border-white/10 focus:border-blue-500/60 focus:ring-blue-500/30'
    }`;

  const isLoading = submitState === 'submitting' || submitState === 'redirecting';

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 pointer-events-none"
          >
            <div className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl shadow-black/60 pointer-events-auto max-h-[90vh] overflow-y-auto">
              {/* Top gradient line */}
              <div className="h-px bg-linear-to-r from-transparent via-blue-500/60 to-transparent" />

              <div className="p-7 flex flex-col gap-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <h2 id="modal-title" className="text-lg font-bold text-white">Complete Purchase</h2>
                    <p className="text-sm text-zinc-500">{product.title} · One-time ₹{product.currentPrice}</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-full border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors shrink-0"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4 text-zinc-400" />
                  </button>
                </div>

                {/* Product summary */}
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-950/60 border border-white/6">
                  <div className="w-14 rounded-lg overflow-hidden border border-white/10 shrink-0">
                    <Image
                      src={bookCover}
                      alt="Deep Dive Into Go"
                      className="w-full h-auto object-cover"
                    />
                  </div>
                  <div className="flex flex-col gap-0.5 flex-1">
                    <span className="text-sm font-semibold text-white">{product.title}</span>
                    <span className="text-xs text-zinc-500">102 chapters · 315 programs · Lifetime access</span>
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    <span className="text-lg font-bold text-white">₹{product.currentPrice}</span>
                    <span className="text-xs text-zinc-600 line-through">₹{product.originalPrice}</span>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>

                  {/* Name row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="modal-first-name" className="text-xs font-medium text-zinc-400">
                        First Name
                      </label>
                      <input
                        id="modal-first-name"
                        type="text"
                        autoComplete="given-name"
                        placeholder="First Name"
                        aria-invalid={!!errors.firstName}
                        {...firstNameRegister}
                        ref={(el) => {
                          firstNameRegister.ref(el);
                          firstFieldRef.current = el;
                        }}
                        className={inputClass(!!errors.firstName)}
                      />
                      {errors.firstName && (
                        <p className="text-[11px] text-red-400">{errors.firstName.message}</p>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="modal-last-name" className="text-xs font-medium text-zinc-400">
                        Last Name
                      </label>
                      <input
                        id="modal-last-name"
                        type="text"
                        autoComplete="family-name"
                        placeholder="Last Name"
                        aria-invalid={!!errors.lastName}
                        {...register('lastName')}
                        className={inputClass(!!errors.lastName)}
                      />
                      {errors.lastName && (
                        <p className="text-[11px] text-red-400">{errors.lastName.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="modal-email" className="text-xs font-medium text-zinc-400">
                      Email Address
                    </label>
                    <input
                      id="modal-email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      aria-invalid={!!errors.email}
                      {...register('email')}
                      className={inputClass(!!errors.email)}
                    />
                    {errors.email ? (
                      <p className="text-[11px] text-red-400">{errors.email.message}</p>
                    ) : (
                      <p className="text-[11px] text-zinc-600 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        PDF delivered to this email instantly
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="modal-phone" className="text-xs font-medium text-zinc-400">
                      Mobile Number
                    </label>
                    <Controller
                      name="phone"
                      control={control}
                      render={({ field }) => (
                        <PhoneInput
                          id="modal-phone"
                          international
                          defaultCountry="IN"
                          value={field.value}
                          onChange={field.onChange}
                          className={`phone-input-wrapper ${errors.phone ? 'phone-input-error' : ''}`}
                          aria-invalid={!!errors.phone}
                        />
                      )}
                    />
                    {errors.phone && (
                      <p className="text-[11px] text-red-400">{errors.phone.message}</p>
                    )}
                  </div>

                  {/* Global error */}
                  {submitState === 'error' && errorMsg && (
                    <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3">
                      <p className="text-sm text-red-400">{errorMsg}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm transition-all duration-200 shadow-lg shadow-blue-600/20 mt-1"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {submitState === 'redirecting' ? 'Redirecting to payment…' : 'Processing…'}
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        {product.ctaPrimary} ₹{product.currentPrice}
                      </>
                    )}
                  </button>
                </form>

                {/* Trust row */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-center gap-4 flex-wrap">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-600">
                      <Shield className="w-3 h-3" />
                      Secure payment
                    </div>
                    <span className="text-zinc-800">·</span>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-600">
                      <Download className="w-3 h-3" />
                      Instant delivery
                    </div>
                    <span className="text-zinc-800">·</span>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-600">
                      <Smartphone className="w-3 h-3" />
                      UPI supported
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2">
                    {['UPI', 'Cards', 'Net Banking', 'Wallets'].map((m) => (
                      <span
                        key={m}
                        className="text-[10px] font-medium text-zinc-600 border border-zinc-800 px-2 py-1 rounded-md"
                      >
                        {m}
                      </span>
                    ))}
                  </div>

                  <p className="text-center text-[11px] text-zinc-700">
                    Powered by Cashfree · 256-bit SSL encrypted
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
