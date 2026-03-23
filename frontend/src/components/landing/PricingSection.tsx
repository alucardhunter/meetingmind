'use client';

import Link from 'next/link';
import { useI18n } from '@/i18n';
import { Button } from '@/components/ui';
import { Check } from 'lucide-react';

const plans = ['free', 'pro', 'team'] as const;

export function PricingSection() {
  const { t } = useI18n();

  return (
    <section id="pricing" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            {t('landing.pricing.title')}
          </h2>
          <p className="text-lg text-slate-600">{t('landing.pricing.subtitle')}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => {
            const planData = t(`landing.pricing.${plan}`) as unknown as {
              name: string;
              price: string;
              period: string;
              description: string;
              features: string[];
            };
            const isPro = plan === 'pro';
            return (
              <div
                key={plan}
                className={`relative rounded-2xl p-8 ${
                  isPro
                    ? 'bg-slate-900 text-white shadow-2xl scale-105 border border-slate-700'
                    : 'bg-white border border-slate-200'
                }`}
              >
                {isPro && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-semibold px-4 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <h3 className={`text-lg font-semibold mb-1 ${isPro ? 'text-white' : 'text-slate-900'}`}>
                    {planData.name}
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-4xl font-bold ${isPro ? 'text-white' : 'text-slate-900'}`}>
                      {planData.price}
                    </span>
                    <span className={`text-sm ${isPro ? 'text-slate-400' : 'text-slate-500'}`}>
                      /{planData.period}
                    </span>
                  </div>
                  <p className={`text-sm mt-2 ${isPro ? 'text-slate-400' : 'text-slate-600'}`}>
                    {planData.description}
                  </p>
                </div>
                <ul className="space-y-3 mb-8">
                  {planData.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check
                        className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                          isPro ? 'text-indigo-400' : 'text-green-500'
                        }`}
                      />
                      <span className={`text-sm ${isPro ? 'text-slate-300' : 'text-slate-600'}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className="block">
                  <Button
                    variant={isPro ? 'primary' : 'outline'}
                    className="w-full"
                    size="lg"
                  >
                    {t('landing.pricing.cta')}
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
