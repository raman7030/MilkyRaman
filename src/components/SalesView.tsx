import React, { useState } from 'react';
import { MilkEntry } from '../types';
import { useDairyStore } from '../data/storage';
import {
  Calendar,
  Filter,
  Plus,
  ShoppingCart,
  TrendingUp,
  Receipt,
  Search,
  Droplets
} from 'lucide-react';

interface SalesViewProps {
  onOpenMilkSell: () => void;
  onViewSlip: (entry: MilkEntry) => void;
}

export const SalesView: React.FC<SalesViewProps> = ({ onOpenMilkSell, onViewSlip }) => {
  const store = useDairyStore();
  const settings = store.getSettings();
  const customers = store.getCustomers();

  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [shiftFilter, setShiftFilter] = useState<'ALL' | 'AM' | 'PM'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const entries = store.getMilkEntries().filter(e => e.entryType === 'CUSTOMER_SELL');

  const filtered = entries.filter(e => {
    const matchesDate = !selectedDate || e.entryDate === selectedDate;
    const matchesShift = shiftFilter === 'ALL' || e.shift === shiftFilter;
    const customer = customers.find(c => c.id === e.partyId);
    const matchesSearch =
      !searchTerm ||
      (customer && customer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (e.note && e.note.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesDate && matchesShift && matchesSearch;
  });

  // Calculate summaries for filtered set
  const totalLitres = filtered.reduce((sum, e) => sum + (parseFloat(e.quantityLitres) || 0), 0);
  const totalRevenue = filtered.reduce((sum, e) => sum + (parseFloat(e.totalAmount) || 0), 0);
  const avgRate = totalLitres > 0 ? totalRevenue / totalLitres : 0;

  return (
    <div className="space-y-4 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-neutral-900 tracking-tight">Daily Retail Sales</h2>
          <p className="text-xs text-neutral-500">Counter sales, household bottles and wholesale cans</p>
        </div>
        <button
          onClick={onOpenMilkSell}
          className="bg-[#167A45] hover:bg-[#13683a] text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4" />
          Milk Sell
        </button>
      </div>

      {/* Date & Shift Bar */}
      <div className="bg-white p-3 rounded-2xl border border-neutral-200/90 shadow-2xs space-y-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-neutral-500 uppercase">Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="text-xs font-bold px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-[#167A45]"
            />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs font-bold text-neutral-500 uppercase mr-1">Shift:</span>
            {(['ALL', 'AM', 'PM'] as const).map(s => (
              <button
                key={s}
                onClick={() => setShiftFilter(s)}
                className={`flex-1 py-1 px-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  shiftFilter === s
                    ? 'bg-[#167A45] text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {s === 'ALL' ? 'All Shifts' : s === 'AM' ? '🌅 AM' : '🌙 PM'}
              </button>
            ))}
          </div>
        </div>

        {/* Search within sales */}
        <div className="relative pt-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3.5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by customer name or note..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#167A45]"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white p-3 rounded-2xl border border-neutral-200 shadow-2xs">
          <div className="text-[10px] font-bold text-neutral-500 uppercase">Revenue</div>
          <div className="text-base sm:text-lg font-black text-[#167A45] mt-0.5">
            {settings.currencySymbol}{totalRevenue.toFixed(2)}
          </div>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-neutral-200 shadow-2xs">
          <div className="text-[10px] font-bold text-neutral-500 uppercase">Volume Sold</div>
          <div className="text-base sm:text-lg font-bold text-neutral-800 mt-0.5 font-mono">
            {totalLitres.toFixed(1)} L
          </div>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-neutral-200 shadow-2xs">
          <div className="text-[10px] font-bold text-neutral-500 uppercase">Avg Rate / L</div>
          <div className="text-base sm:text-lg font-bold text-neutral-800 mt-0.5 font-mono">
            {settings.currencySymbol}{avgRate.toFixed(1)}
          </div>
        </div>
      </div>

      {/* Sales Transactions List */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 px-1">
          Transactions ({filtered.length})
        </h3>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-neutral-200 text-neutral-500 text-xs">
            No sales recorded for the selected date and shift. Click "+ Milk Sell" to add one!
          </div>
        ) : (
          filtered.map(entry => {
            const customer = customers.find(c => c.id === entry.partyId);
            return (
              <div
                key={entry.id}
                onClick={() => onViewSlip(entry)}
                className="bg-white hover:bg-emerald-50/40 rounded-2xl p-3.5 border border-neutral-200/90 shadow-2xs flex items-center justify-between transition-all cursor-pointer"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-neutral-900">
                      {customer ? customer.name : 'Unknown Customer'}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-neutral-100 text-neutral-700">
                      {entry.shift}
                    </span>
                    <span className="text-[10px] font-semibold text-neutral-500">
                      {entry.milkType}
                    </span>
                  </div>
                  <div className="text-xs text-neutral-500 flex items-center gap-2 font-mono">
                    <span className="font-bold text-neutral-800">
                      {parseFloat(entry.quantityLitres).toFixed(2)} L
                    </span>
                    <span>×</span>
                    <span>{settings.currencySymbol}{parseFloat(entry.ratePerLitre).toFixed(2)}/L</span>
                    {entry.note && (
                      <span className="text-neutral-400 font-sans truncate max-w-[140px]">
                        · {entry.note}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-base font-black text-neutral-900 font-mono">
                    {settings.currencySymbol}{parseFloat(entry.totalAmount).toFixed(2)}
                  </div>
                  <span className="text-[10px] text-[#167A45] font-semibold flex items-center justify-end gap-1">
                    <Receipt className="w-3 h-3" />
                    View Slip
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
