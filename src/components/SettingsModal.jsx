import React, { useState } from 'react';
import { X, Key, Database, Download, Upload, Trash2, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { useCollection } from '../context/CollectionContext';
import { storage, STORAGE_KEYS } from '../utils/storage';

export function SettingsModal({ onClose, onRefreshSets }) {
  const { settings, updateSettings, exportCollectionJSON, importCollectionJSON, clearCollection } = useCollection();
  
  const [apiKey, setApiKey] = useState(settings.apiKey || '');
  const [isSaved, setIsSaved] = useState(false);
  const [importStatus, setImportStatus] = useState(null);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    updateSettings({ apiKey: apiKey.trim() });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleClearCache = () => {
    storage.removeItem(STORAGE_KEYS.SETS_CACHE);
    // Remove individual card caches
    Object.keys(localStorage).forEach((k) => {
      if (k.startsWith(STORAGE_KEYS.CARDS_CACHE_PREFIX)) {
        localStorage.removeItem(k);
      }
    });
    alert('Cache cleared! Sets and cards will be re-fetched on next request.');
    if (onRefreshSets) onRefreshSets();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        const result = importCollectionJSON(content);
        if (result.success) {
          setImportStatus(`Successfully restored ${result.count} cards!`);
        } else {
          setImportStatus(`Import failed: ${result.error}`);
        }
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    clearCollection();
    setShowConfirmReset(false);
    alert('Collection has been reset.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10 max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <h2 className="text-lg font-bold text-white font-display">
            Settings & Data Management
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* API Key Section */}
          <form onSubmit={handleSaveSettings} className="space-y-3">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-rose-500" />
              <label className="text-sm font-bold text-white">
                PokémonTCG.io API Key (Optional)
              </label>
            </div>
            <p className="text-xs text-slate-400">
              The app works out-of-the-box using standard rate limits. Adding your free API key from{' '}
              <a
                href="https://pokemontcg.io"
                target="_blank"
                rel="noreferrer"
                className="text-rose-400 underline hover:text-rose-300"
              >
                pokemontcg.io
              </a>{' '}
              boosts your rate limit to 20,000 requests per day.
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="e.g. 1a2b3c4d-5e6f-7g8h..."
                className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 font-mono"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition"
              >
                Save
              </button>
            </div>

            {isSaved && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                <span>API key saved successfully!</span>
              </div>
            )}
          </form>

          {/* Cache Management */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-bold text-white">Offline Cache Management</span>
            </div>
            <p className="text-xs text-slate-400">
              Sets and card pictures are cached locally in your browser to make browsing instantaneous. You can clear this cache to fetch fresh updates.
            </p>

            <button
              type="button"
              onClick={handleClearCache}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Clear Cached Cards & Refresh Sets</span>
            </button>
          </div>

          {/* Backup & Restore */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-bold text-white">Backup & Restore Collection</span>
            </div>
            <p className="text-xs text-slate-400">
              Your collection data is saved in your browser's local storage. Download a JSON backup anytime so you never lose your progress.
            </p>

            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={exportCollectionJSON}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/30 text-xs font-bold transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download JSON Backup</span>
              </button>

              <label className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold cursor-pointer transition">
                <Upload className="w-3.5 h-3.5" />
                <span>Restore from File</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {importStatus && (
              <p className="text-xs font-semibold text-emerald-400 mt-2">
                {importStatus}
              </p>
            )}
          </div>

          {/* Danger Zone */}
          <div className="pt-4 border-t border-slate-800">
            {!showConfirmReset ? (
              <button
                type="button"
                onClick={() => setShowConfirmReset(true)}
                className="flex items-center gap-1.5 text-xs text-rose-400/80 hover:text-rose-400 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset Entire Collection Data</span>
              </button>
            ) : (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 space-y-2">
                <p className="text-xs text-rose-300 font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  Are you sure you want to erase all tracked cards?
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition"
                  >
                    Yes, Erase Everything
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowConfirmReset(false)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
