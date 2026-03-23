'use client';

import { useI18n } from '@/i18n';
import { FileText, Brain, ListTodo, Shield } from 'lucide-react';

const icons = {
  transcription: FileText,
  extraction: Brain,
  tracking: ListTodo,
  export: Shield,
};

const featureKeys = ['transcription', 'extraction', 'tracking', 'export'] as const;

export function FeaturesSection() {
  const { t } = useI18n();

  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            {t('landing.features.title')}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featureKeys.map((key) => {
            const Icon = icons[key];
            const feature = t(`landing.features.${key}`) as unknown as { title: string; description: string };
            return (
              <div
                key={key}
                className="group p-8 rounded-2xl bg-white border border-slate-200 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors duration-300">
                  <Icon className="w-6 h-6 text-indigo-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
