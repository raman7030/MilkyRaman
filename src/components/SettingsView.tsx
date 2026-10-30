import React, { useState } from 'react';
import { DairySettings, RateSlab } from '../types';
import { useDairyStore } from '../data/storage';
import {
  Settings,
  Save,
  Plus,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  Building2,
  Table,
  Check,
  ShieldCheck
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const store = useDairyStore();
  const currentSettings = store.getSettings();

  const [formData, setFormData] = useState<DairySettings>(currentSettings);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // New Slab form
  const [newMinFat, setNewMinFat] = useState('4.0');
  const [newRate, setNewRate] = useState('44.00');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    store.saveSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleAddSlab = (e: React.FormEvent) => {
    e.preventDefault();
    const fat = parseFloat(newMinFat) || 0;
    const rate = parseFloat(newRate) || 0;

    const updatedSlabs = [...formData.rateChart, { minFat: fat, ratePerLitre: rate }];
    // Sort slabs by FAT threshold ascending
    updatedSlabs.sort((a, b) => a.minFat - b.minFat);

    const updated = { ...formData, rateChart: updatedSlabs };
    setFormData(updated);
    store.saveSettings(updated);
  };

  const handleDeleteSlab = (index: number) => {
    const updatedSlabs = formData.rateChart.filter((_, i) => i !== index);
    const updated = { ...formData, rateChart: updatedSlabs };
    setFormData(updated);
    store.saveSettings(updated);
  };

  const handleExportBackup = () => {
    const backupStr = store.exportBackup();
    const blob = new Blob([backupStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `milkyraman_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      const content = evt.target?.result as string;
      if (content && store.importBackup(content)) {
        alert('Backup successfully restored!');
        setFormData(store.getSettings());
      } else {
        alert('Invalid backup file format');
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    if (confirm('Are you sure you want to reset all data to default demo state? Current entries will be replaced.')) {
      store.resetToDefaults();
      setFormData(store.getSettings());
      alert('Data reset to defaults.');
    }
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-neutral-900 tracking-tight">Dairy Settings & Rate Chart</h2>
          <p className="text-xs text-neutral-500">Business details, FAT rate chart and data backup</p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-[#167A45]" />
          Settings updated successfully!
        </div>
      )}

      {/* Dairy Profile Form */}
      <form onSubmit={handleSaveProfile} className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 border-b border-neutral-100 pb-2">
          <Building2 className="w-4 h-4 text-[#167A45]" />
          <h3 className="text-sm font-bold text-neutral-900">Dairy Information & Print Header</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Dairy Business Name</label>
            <input
              type="text"
              value={formData.dairyName}
              onChange={e => setFormData({ ...formData, dairyName: e.target.value })}
              className="w-full text-xs px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#167A45]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Tagline</label>
            <input
              type="text"
              value={formData.tagline}
              onChange={e => setFormData({ ...formData, tagline: e.target.value })}
              className="w-full text-xs px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#167A45]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Owner Name</label>
            <input
              type="text"
              value={formData.ownerName}
              onChange={e => setFormData({ ...formData, ownerName: e.target.value })}
              className="w-full text-xs px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#167A45]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Contact Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              className="w-full text-xs px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#167A45]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Address / Center Location</label>
            <input
              type="text"
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              className="w-full text-xs px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#167A45]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Default Cow Milk Buy Rate (₹/L)</label>
            <input
              type="number"
              step="0.5"
              value={formData.cowDefaultRate}
              onChange={e => setFormData({ ...formData, cowDefaultRate: e.target.value })}
              className="w-full text-xs px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#167A45]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Default Buffalo Milk Buy Rate (₹/L)</label>
            <input
              type="number"
              step="0.5"
              value={formData.buffaloDefaultRate}
              onChange={e => setFormData({ ...formData, buffaloDefaultRate: e.target.value })}
              className="w-full text-xs px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#167A45]"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="bg-[#167A45] hover:bg-[#13683a] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            Save Profile
          </button>
        </div>
      </form>

      {/* Rate Chart Editor */}
      <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
          <div className="flex items-center gap-2">
            <Table className="w-4 h-4 text-[#167A45]" />
            <h3 className="text-sm font-bold text-neutral-900">Procurement FAT Rate Chart</h3>
          </div>
          <span className="text-[11px] text-neutral-500 font-mono">
            {formData.rateChart.length} Slabs Configured
          </span>
        </div>

        <p className="text-xs text-neutral-500">
          The procurement rate is selected automatically from the highest FAT threshold met by the milk reading.
        </p>

        {/* Existing Slabs Table */}
        <div className="overflow-x-auto rounded-xl border border-neutral-200">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F6F8F6] text-neutral-700 font-bold uppercase text-[10px]">
              <tr>
                <th className="px-3 py-2">Min FAT (%)</th>
                <th className="px-3 py-2">Rate / Litre ({formData.currencySymbol})</th>
                <th className="px-3 py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-mono">
              {formData.rateChart.map((slab, idx) => (
                <tr key={idx} className="hover:bg-neutral-50">
                  <td className="px-3 py-2 font-bold text-neutral-800">≥ {slab.minFat.toFixed(1)}%</td>
                  <td className="px-3 py-2 font-black text-[#167A45]">
                    {formData.currencySymbol}{slab.ratePerLitre.toFixed(2)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => handleDeleteSlab(idx)}
                      className="text-neutral-400 hover:text-red-600 p-1 rounded-md transition-colors cursor-pointer"
                      title="Remove slab"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Slab Sub-Form */}
        <div className="bg-[#F6F8F6] p-3 rounded-xl border border-neutral-200">
          <h4 className="text-xs font-bold text-neutral-700 mb-2">+ Add New Rate Slab</h4>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] font-semibold text-neutral-500 uppercase block mb-0.5">Min FAT</label>
              <input
                type="number"
                step="0.1"
                value={newMinFat}
                onChange={e => setNewMinFat(e.target.value)}
                className="w-full text-xs px-2 py-1.5 bg-white border rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-neutral-500 uppercase block mb-0.5">Rate / L</label>
              <input
                type="number"
                step="0.5"
                value={newRate}
                onChange={e => setNewRate(e.target.value)}
                className="w-full text-xs px-2 py-1.5 bg-white border rounded-lg font-mono font-bold"
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={handleAddSlab}
                className="w-full py-1.5 bg-[#167A45] hover:bg-[#13683a] text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-2xs"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Offline Backup & Restore */}
      <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 border-b border-neutral-100 pb-2">
          <ShieldCheck className="w-4 h-4 text-[#167A45]" />
          <h3 className="text-sm font-bold text-neutral-900">Local Data Security & Backup</h3>
        </div>

        <p className="text-xs text-neutral-500 leading-relaxed">
          Your dairy records remain securely on this device without requiring third-party cloud subscriptions. You can download complete JSON data backups at any time to preserve records.
        </p>

        <div className="flex flex-wrap gap-2.5 pt-1">
          <button
            onClick={handleExportBackup}
            className="bg-[#167A45] hover:bg-[#13683a] text-white text-xs font-bold px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            Download JSON Backup
          </button>

          <label className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors">
            <Upload className="w-4 h-4" />
            Restore from Backup
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </label>

          <button
            onClick={handleResetData}
            className="bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors border border-red-200"
          >
            <RefreshCw className="w-4 h-4" />
            Reset Demo Data
          </button>
        </div>
      </div>
    </div>
  );
};
