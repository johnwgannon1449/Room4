import React from 'react';
import { useTranslation } from 'react-i18next';

export default function ArchivePage() {
  const { t } = useTranslation();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('nav.archive')}</h1>
      <p className="text-gray-500 mb-8">Your saved lesson plans will appear here.</p>

      <div className="card text-center py-16">
        <div className="text-4xl mb-3">📂</div>
        <p className="font-medium text-gray-700">No lessons archived yet.</p>
        <p className="text-sm text-gray-500 mt-1">
          Complete your first lesson analysis to see it here.
        </p>
      </div>
    </div>
  );
}
