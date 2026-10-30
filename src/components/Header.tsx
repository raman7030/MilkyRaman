import React, { useState } from 'react';
import { Bell, Info, ShieldCheck, Database, Calendar } from 'lucide-react';
import { useDairyStore } from '../data/storage';

export const Header: React.FC = () => {
  const store = useDairyStore();
  const settings = store.getSettings();
  const [showInfo, setShowInfo] = useState(false);

  const todayFormatted = new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date());

  return (
    <>
      <header className="sticky top-0 z-30 bg-[#F6F8F6]/90 backdrop-blur-md border-b border-neutral-200/80 px-4 py-3 sm:px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🥛</span>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#167A45]">
                {settings.dairyName || 'MilkyRaman'}
              </h1>
            </div>
            <p className="text-[10px] sm:text-xs font-bold text-neutral-500 uppercase tracking-wider pl-8">
              {settings.tagline || 'YOUR DAIRY. ONE SIMPLE HISAB.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-neutral-600 bg-white px-3 py-1.5 rounded-full border border-neutral-200 shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-[#167A45]" />
              <span>{todayFormatted}</span>
            </div>

            <button
              onClick={() => setShowInfo(true)}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-700 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              title="About MilkyRaman"
            >
              <Info className="w-4 h-4 text-[#167A45]" />
              <span className="hidden sm:inline">Info & Sync</span>
            </button>
          </div>
        </div>
      </header>

      {/* Info Modal */}
      {showInfo && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-neutral-200 space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#167A45]" />
                <h3 className="font-bold text-sm text-neutral-900">MilkyRaman Dairy System</h3>
              </div>
              <span className="text-xs font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">v0.2.0</span>
            </div>

            <div className="text-xs text-neutral-600 space-y-2 leading-relaxed">
              <p>
                <strong>Offline-First Architecture:</strong> All procurement, retail sales, customer khata, and farmer ledgers operate 100% locally on your device with high-precision decimal calculations.
              </p>
              <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 flex items-center gap-2 text-emerald-900 text-[11px]">
                <Database className="w-4 h-4 shrink-0 text-[#167A45]" />
                <span>Local storage database active and synced across all modules.</span>
              </div>
              <p className="text-[11px] text-neutral-500">
                Created for single-owner dairy operations covering farmer milk procurement, FAT/SNF rate slabs, customer deliveries, and billing.
              </p>
            </div>

            <button
              onClick={() => setShowInfo(false)}
              className="w-full py-2 bg-[#167A45] text-white text-xs font-bold rounded-xl hover:bg-[#13683a] transition-colors cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
