import React from 'react';
import { Sparkles, SlidersHorizontal, BookOpen, Layers, Heart, Download } from 'lucide-react';
import { useCollection } from '../context/CollectionContext';

export function Header({ onOpenSettings, onOpenOverview, activeTab, setActiveTab }) {
  const { summary, isServerConnected } = useCollection();

  return (
    <header className="sticky top-0 z-30 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Logo & Branding */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('sets')}>
            <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-600 via-red-500 to-amber-500 p-0.5 shadow-lg shadow-rose-900/30">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center overflow-hidden">
                <svg className="w-7 h-7 text-rose-500 transition-transform duration-300 hover:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" className="text-rose-500 fill-rose-500/20" />
                  <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" />
                  <circle cx="12" cy="12" r="3.5" fill="white" stroke="currentColor" />
                  <circle cx="12" cy="12" r="1.5" fill="#e11d48" />
                </svg>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-xl sm:text-2xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  PokéVault <span className="text-rose-500">UK</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  TCG Repository
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Card Sets • Collection Tracker • UK Cheapest Marketplace Links
              </p>
            </div>
          </div>

          {/* Navigation & Stats pill */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Database Sync Status Badge */}
            <div
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold transition ${
                isServerConnected
                  ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                  : 'bg-amber-950/40 border-amber-500/30 text-amber-300'
              }`}
              title={isServerConnected ? 'Connected to Mac central database. Cards auto-sync in real time across phone and Mac.' : 'Running in offline/local storage mode.'}
            >
              <div className={`w-2 h-2 rounded-full ${isServerConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span>{isServerConnected ? 'DB Synced' : 'Offline'}</span>
            </div>

            {/* Quick Collection Badge */}
            <button
              onClick={onOpenOverview}
              className="flex items-center gap-2.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition shadow-sm text-left group"
              title="Click to view overall collection summary"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <div className="text-xs">
                <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider group-hover:text-emerald-400 transition">
                  Collection
                </div>
                <div className="font-semibold text-slate-200 flex items-baseline gap-1">
                  <span className="text-emerald-400 font-bold">{summary.uniqueCards}</span>
                  <span>cards</span>
                  {summary.totalPhysicalCards > summary.uniqueCards && (
                    <span className="text-[10px] text-slate-400 font-normal">
                      ({summary.totalPhysicalCards} total)
                    </span>
                  )}
                </div>
              </div>
            </button>

            {/* Wishlist button */}
            {summary.wishlistCount > 0 && (
              <button
                onClick={() => setActiveTab('wishlist')}
                className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition ${
                  activeTab === 'wishlist'
                    ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                    : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                <span>Wishlist ({summary.wishlistCount})</span>
              </button>
            )}

            {/* Settings & Tools */}
            <button
              onClick={onOpenSettings}
              className="p-2 sm:p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition shadow-sm"
              title="Settings, API Key & Data Backup"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
