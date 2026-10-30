import React, { useState } from 'react';
import { Farmer, MilkEntry, Payment } from '../types';
import { useDairyStore } from '../data/storage';
import {
  Search,
  Plus,
  Phone,
  Droplets,
  CreditCard,
  History,
  X,
  Check,
  ArrowUpRight,
  Trash2
} from 'lucide-react';

interface FarmersViewProps {
  onOpenMilkBuyForFarmer: (farmerId: string) => void;
  onOpenPaymentForFarmer: (farmerId: string) => void;
  onViewSlip: (entry?: MilkEntry, payment?: Payment) => void;
}

export const FarmersView: React.FC<FarmersViewProps> = ({
  onOpenMilkBuyForFarmer,
  onOpenPaymentForFarmer,
  onViewSlip
}) => {
  const store = useDairyStore();
  const settings = store.getSettings();
  const farmers = store.getFarmers();

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedFarmerHistory, setSelectedFarmerHistory] = useState<Farmer | null>(null);

  // New Farmer Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [milkType, setMilkType] = useState<'COW' | 'BUFFALO' | 'MIXED'>('COW');
  const [error, setError] = useState<string | null>(null);

  const filteredFarmers = farmers.filter(f => f.active !== false).filter(f => {
    const matchesSearch =
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.phone.includes(search);
    const matchesType = filterType === 'ALL' || f.milkType === filterType;
    return matchesSearch && matchesType;
  });

  const handleAddFarmer = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError('Farmer name is required');
      return;
    }
    store.addFarmer({
      name: name.trim(),
      phone: phone.trim(),
      milkType,
      active: true
    });
    setName('');
    setPhone('');
    setShowAddModal(false);
  };

  // Farmer history records
  const farmerEntries = selectedFarmerHistory
    ? store.getMilkEntries().filter(e => e.partyId === selectedFarmerHistory.id)
    : [];
  const farmerPayments = selectedFarmerHistory
    ? store.getPayments().filter(p => p.partyId === selectedFarmerHistory.id)
    : [];

  return (
    <div className="space-y-4 pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-neutral-900 tracking-tight">Farmers (Suppliers)</h2>
          <p className="text-xs text-neutral-500">Registry, procurement records and payable dues</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#167A45] hover:bg-[#13683a] text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Farmer
        </button>
      </div>

      {/* Search & Filter */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
          <input
            type="text"
            placeholder="Search farmer by name or phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#167A45]"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
          {['ALL', 'COW', 'BUFFALO', 'MIXED'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                filterType === type
                  ? 'bg-[#167A45] text-white'
                  : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              {type === 'ALL' ? 'All Farmers' : `${type} Milk`}
            </button>
          ))}
        </div>
      </div>

      {/* Farmers List */}
      <div className="space-y-2.5">
        {filteredFarmers.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-neutral-200 text-neutral-500 text-xs">
            No farmers found matching your criteria.
          </div>
        ) : (
          filteredFarmers.map(farmer => {
            const bal = store.getFarmerBalance(farmer.id);
            return (
              <div
                key={farmer.id}
                className="bg-white rounded-2xl p-4 border border-neutral-200/90 shadow-2xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-neutral-900">{farmer.name}</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {farmer.milkType}
                      </span>
                    </div>
                    {farmer.phone && (
                      <a
                        href={`tel:${farmer.phone}`}
                        className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5 hover:text-[#167A45]"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{farmer.phone}</span>
                      </a>
                    )}
                  </div>

                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => {
                        const confirmed = window.confirm(`Delete ${farmer.name} from active farmers? Their milk purchase and payout history will be retained.`);
                        if (confirmed) store.deleteFarmer(farmer.id);
                      }}
                      className="mb-2 inline-flex items-center gap-1 rounded-lg border border-red-200 px-2 py-1 text-[10px] font-bold text-red-700 hover:bg-red-50"
                      aria-label={`Delete farmer ${farmer.name}`}
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                    <span className="text-[10px] font-semibold text-neutral-500 uppercase">
                      Payable Due
                    </span>
                    <div
                      className={`text-sm font-extrabold ${
                        bal.balanceDue > 0 ? 'text-amber-700' : 'text-neutral-700'
                      }`}
                    >
                      {settings.currencySymbol}
                      {bal.balanceDue.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Metrics ribbon */}
                <div className="grid grid-cols-3 gap-2 bg-[#F6F8F6] p-2.5 rounded-xl text-center text-xs">
                  <div>
                    <div className="text-[10px] text-neutral-500 font-medium">Delivered</div>
                    <div className="font-bold font-mono text-neutral-800">{bal.totalLitres.toFixed(1)} L</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-neutral-500 font-medium">Total Bill</div>
                    <div className="font-bold font-mono text-neutral-800">
                      {settings.currencySymbol}{bal.totalPayable.toFixed(0)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-neutral-500 font-medium">Paid</div>
                    <div className="font-bold font-mono text-emerald-700">
                      {settings.currencySymbol}{bal.totalPaid.toFixed(0)}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-0.5">
                  <button
                    onClick={() => onOpenMilkBuyForFarmer(farmer.id)}
                    className="flex-1 py-1.5 px-2 bg-[#E5F3E9] hover:bg-[#d8edd0] text-[#167A45] font-bold text-xs rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-colors"
                  >
                    <Droplets className="w-3.5 h-3.5" />
                    Milk Buy
                  </button>
                  <button
                    onClick={() => onOpenPaymentForFarmer(farmer.id)}
                    className="flex-1 py-1.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-colors border border-amber-200"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    Payout
                  </button>
                  <button
                    onClick={() => setSelectedFarmerHistory(farmer)}
                    className="py-1.5 px-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold text-xs rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <History className="w-3.5 h-3.5" />
                    Khata
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Farmer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-neutral-200">
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className="font-bold text-sm text-neutral-900">Add New Farmer</h3>
              <button onClick={() => setShowAddModal(false)} className="cursor-pointer text-neutral-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddFarmer} className="space-y-3 pt-3">
              {error && <div className="text-xs text-red-600 bg-red-50 p-2 rounded-lg">{error}</div>}

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Farmer Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Patel"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#167A45]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Mobile / Phone</label>
                <input
                  type="tel"
                  placeholder="e.g. +91 98250 11223"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full text-xs px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#167A45]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Primary Milk</label>
                <select
                  value={milkType}
                  onChange={e => setMilkType(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#167A45]"
                >
                  <option value="COW">Cow Milk</option>
                  <option value="BUFFALO">Buffalo Milk</option>
                  <option value="MIXED">Mixed Milk</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 text-xs font-bold border rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-bold bg-[#167A45] text-white rounded-xl hover:bg-[#13683a]"
                >
                  Save Farmer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Farmer History Modal */}
      {selectedFarmerHistory && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-neutral-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b">
              <div>
                <h3 className="font-bold text-base text-neutral-900">{selectedFarmerHistory.name} - Ledger</h3>
                <p className="text-xs text-neutral-500">Procurement & Payout History</p>
              </div>
              <button
                onClick={() => setSelectedFarmerHistory(null)}
                className="p-1 rounded-full hover:bg-neutral-100 cursor-pointer"
              >
                <X className="w-5 h-5 text-neutral-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-4">
              {/* Milk Purchases */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                  Recent Milk Supplies ({farmerEntries.length})
                </h4>
                {farmerEntries.length === 0 ? (
                  <p className="text-xs text-neutral-400 italic">No supply records yet.</p>
                ) : (
                  <div className="space-y-1.5">
                    {farmerEntries.map(e => (
                      <div
                        key={e.id}
                        onClick={() => onViewSlip(e, undefined)}
                        className="p-2.5 bg-neutral-50 rounded-xl flex items-center justify-between text-xs hover:bg-emerald-50 transition-colors cursor-pointer border border-neutral-100"
                      >
                        <div>
                          <div className="font-bold text-neutral-800">
                            {e.entryDate} ({e.shift}) · {parseFloat(e.quantityLitres).toFixed(2)} L {e.milkType}
                          </div>
                          <div className="text-[11px] text-neutral-500">
                            {e.fat ? `FAT: ${e.fat}% | SNF: ${e.snf || '-'}% · ` : ''}
                            Rate: {settings.currencySymbol}{e.ratePerLitre}
                          </div>
                        </div>
                        <div className="font-bold text-emerald-800 font-mono">
                          {settings.currencySymbol}{parseFloat(e.totalAmount).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Payments to Farmer */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                  Payouts Given ({farmerPayments.length})
                </h4>
                {farmerPayments.length === 0 ? (
                  <p className="text-xs text-neutral-400 italic">No payouts recorded yet.</p>
                ) : (
                  <div className="space-y-1.5">
                    {farmerPayments.map(p => (
                      <div
                        key={p.id}
                        onClick={() => onViewSlip(undefined, p)}
                        className="p-2.5 bg-neutral-50 rounded-xl flex items-center justify-between text-xs hover:bg-amber-50 transition-colors cursor-pointer border border-neutral-100"
                      >
                        <div>
                          <div className="font-bold text-neutral-800">
                            {p.paymentDate} · {p.method}
                          </div>
                          {p.reference && <div className="text-[11px] text-neutral-500">Ref: {p.reference}</div>}
                        </div>
                        <div className="font-bold text-amber-800 font-mono">
                          {settings.currencySymbol}{parseFloat(p.amount).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t">
              <button
                onClick={() => setSelectedFarmerHistory(null)}
                className="w-full py-2.5 bg-neutral-800 text-white font-bold text-xs rounded-xl"
              >
                Close Ledger
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
