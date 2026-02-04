import React, { useState } from 'react';
import DealPhaseSettings from './settings/DealPhaseSettings';
import ProductSettings from './settings/ProductSettings';

const SETTINGS_PAGES = [
  { id: 'deal-phases', label: 'Affärsfaser', component: DealPhaseSettings },
  { id: 'products', label: 'Produkter', component: ProductSettings },
];

export default function Settings() {
  const [activePage, setActivePage] = useState('deal-phases');

  const ActiveComponent = SETTINGS_PAGES.find(p => p.id === activePage)?.component;

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* --- RUBRIK --- */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Inställningar</h1>
        <p className="text-gray-500 dark:text-gray-400">Inställningar för ditt CRM</p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar navigation */}
        <nav className="w-48 shrink-0">
          <h2 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-3 ml-1 tracking-widest">Kategorier</h2>
          <div className="space-y-1">
            {SETTINGS_PAGES.map(page => (
              <button
                key={page.id}
                onClick={() => setActivePage(page.id)}
                className={`block w-full text-left px-3 py-2 rounded-xl font-medium transition-all ${
                  activePage === page.id
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {page.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Active settings content */}
        <div className="flex-1 max-w-2xl">
          {ActiveComponent && <ActiveComponent />}
        </div>
      </div>
    </div>
  );
}
