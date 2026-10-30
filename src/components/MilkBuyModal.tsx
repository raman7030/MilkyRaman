import React, { useState, useEffect } from 'react';
import { MilkType, ShiftType, Farmer, MilkEntry } from '../types';
import { useDairyStore } from '../data/storage';
import { MilkPricing } from '../domain/pricing';
import { X, Calculator, Plus, UserPlus, Check } from 'lucide-react';

interface MilkBuyModalProps {
  onClose: () => void;
  onSuccess: (savedEntry: MilkEntry) => void;
}

export const MilkBuyModal: React.FC<MilkBuyModalProps> = ({ onClose, onSuccess }) => {
  const store = useDairyStore();
  const settings = store.getSettings();
  const farmers = store.getFarmers().filter(f => f.active);

  const [farmerId, setFarmerId] = useState(farmers[0]?.id || '');
  const [entryDate, setEntryDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [shift, setShift] = useState<ShiftType>(() => (new Date().getHours() < 14 ? 'AM' : 'PM'));
  const [milkType, setMilkType] = useState<MilkType>('COW');
  const [calcMode, setCalcMode] = useState<'CHART' | 'FIXED'>('CHART');

  const [quantity, setQuantity] = useState('10.0');
  const [fat, setFat] = useState('3.8');
  const [fixedRate, setFixedRate] = useState(settings.cowDefaultRate || '42.00');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Quick inline add farmer
  const [showAddFarmer, setShowAddFarmer] = useState(false);
  const [newFarmerName, setNewFarmerName] = useState('');
  const [newFarmerPhone, setNewFarmerPhone] = useState('');

  // Selected farmer updates default milk type
  useEffect(() => {
    const sel = farmers.find(f => f.id === farmerId);
    if (sel) {
      setMilkType(sel.milkType);
      if (sel.milkType === 'BUFFALO') {
        setFat('6.2');
        setFixedRate(settings.buffaloDefaultRate || '56.00');
      } else {
        setFat('3.8');
        setFixedRate(settings.cowDefaultRate || '42.00');
      }
    }
  }, [farmerId]);

  // Live calculation
  let calculatedRate = 0;
  let calculatedTotal = 0;
  let calcError = '';

  try {
    const qtyNum = parseFloat(quantity) || 0;
    if (qtyNum > 0) {
      if (calcMode === 'CHART') {
        const fatNum = parseFloat(fat) || 0;
        const res = MilkPricing.fromRateChart(qtyNum, { fat: fatNum }, settings.rateChart);
        calculatedRate = res.ratePerLitre;
        calculatedTotal = res.total;
      } else {
        const rateNum = parseFloat(fixedRate) || 0;
        const res = MilkPricing.fixedRate(qtyNum, rateNum);
        calculatedRate = res.ratePerLitre;
        calculatedTotal = res.total;
      }
    }
  } catch (err: any) {
    calcError = err.message || 'Calculation error';
  }

  const handleQuickAddFarmer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFarmerName.trim()) return;
    const created = store.addFarmer({
      name: newFarmerName.trim(),
      phone: newFarmerPhone.trim(),
      milkType: milkType,
      active: true
    });
    setFarmerId(created.id);
    setShowAddFarmer(false);
    setNewFarmerName('');
    setNewFarmerPhone('');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!farmerId) {
      setError('Please select or register a farmer');
      return;
    }

    const qtyNum = parseFloat(quantity);
    if (isNaN(qtyNum) || qtyNum <= 0) {
      setError('Quantity must be greater than zero');
      return;
    }

    if (calcMode === 'CHART' && calcError) {
      setError(calcError);
      return;
    }

    try {
      const entry = store.addMilkEntry({
        partyId: farmerId,
        entryType: 'FARMER_BUY',
        entryDate,
        shift,
        milkType,
        quantityLitres: qtyNum.toFixed(2),
        fat: calcMode === 'CHART' ? fat : null,
        snf: null,
        ratePerLitre: calculatedRate.toFixed(2),
        totalAmount: calculatedTotal.toFixed(2),
        note: note.trim()
      });
      onSuccess(entry);
    } catch (err: any) {
      setError(err.message || 'Failed to save entry');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-neutral-200 animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Modal Header */}
        <div className="bg-[#167A45] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-bold text-lg">
              🥛
            </div>
            <div>
              <h2 className="text-base font-bold leading-tight">Milk Buy (Procurement)</h2>
              <p className="text-xs text-white/80">Intake from Farmer · FAT-based rate · AM/PM</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-4 max-h-[82vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 font-medium">
              ⚠️ {error}
            </div>
          )}

          {/* Farmer Selection or Inline Creation */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider">Farmer (Supplier)</label>
              <button
                type="button"
                onClick={() => setShowAddFarmer(!showAddFarmer)}
                className="text-xs font-semibold text-[#167A45] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                {showAddFarmer ? 'Cancel' : '+ New Farmer'}
              </button>
            </div>

            {showAddFarmer ? (
              <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2 mb-2">
                <input
                  type="text"
                  placeholder="Farmer Full Name (e.g. Ramesh Patel)"
                  value={newFarmerName}
                  onChange={e => setNewFarmerName(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#167A45]"
                />
                <div className="flex gap-2">
                  <input
                    type="tel"
                    placeholder="Mobile / Phone (optional)"
                    value={newFarmerPhone}
                    onChange={e => setNewFarmerPhone(e.target.value)}
                    className="flex-1 text-xs px-3 py-2 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#167A45]"
                  />
                  <button
                    type="button"
                    onClick={handleQuickAddFarmer}
                    className="bg-[#167A45] text-white text-xs px-3 py-2 rounded-lg font-semibold hover:bg-[#13683a] cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>
            ) : (
              <select
                value={farmerId}
                onChange={e => setFarmerId(e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#167A45]"
                required
              >
                {farmers.length === 0 && <option value="">No active farmers. Add one!</option>}
                {farmers.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.name} {f.phone ? `(${f.phone})` : ''} — {f.milkType}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Date & Shift */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">Date</label>
              <input
                type="date"
                value={entryDate}
                onChange={e => setEntryDate(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#167A45]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">Shift</label>
              <div className="grid grid-cols-2 gap-1 bg-neutral-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setShift('AM')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    shift === 'AM' ? 'bg-[#167A45] text-white shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  🌅 AM
                </button>
                <button
                  type="button"
                  onClick={() => setShift('PM')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    shift === 'PM' ? 'bg-[#167A45] text-white shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  🌙 PM
                </button>
              </div>
            </div>
          </div>

          {/* Milk Type & Pricing Mode */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">Milk Type</label>
              <select
                value={milkType}
                onChange={e => setMilkType(e.target.value as MilkType)}
                className="w-full text-xs px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#167A45]"
              >
                <option value="COW">Cow Milk</option>
                <option value="BUFFALO">Buffalo Milk</option>
                <option value="MIXED">Mixed Milk</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">Pricing Mode</label>
              <div className="grid grid-cols-2 gap-1 bg-neutral-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setCalcMode('CHART')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    calcMode === 'CHART' ? 'bg-[#167A45] text-white shadow-xs' : 'text-neutral-600'
                  }`}
                >
                  FAT Based
                </button>
                <button
                  type="button"
                  onClick={() => setCalcMode('FIXED')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    calcMode === 'FIXED' ? 'bg-[#167A45] text-white shadow-xs' : 'text-neutral-600'
                  }`}
                >
                  Fixed Rate
                </button>
              </div>
            </div>
          </div>

          {/* Quantity Input */}
          <div className="bg-[#E5F3E9] p-3.5 rounded-2xl border border-emerald-200">
            <label className="block text-xs font-extrabold text-[#167A45] uppercase tracking-wider mb-1">
              Quantity (Litres)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.05"
                min="0.1"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                className="w-full text-2xl font-bold font-mono px-3 py-2 bg-white rounded-xl border border-emerald-300 focus:outline-none focus:ring-2 focus:ring-[#167A45] text-neutral-900"
                required
              />
              <span className="absolute right-3.5 top-2.5 font-bold text-neutral-400 text-sm">LITRES</span>
            </div>
          </div>

          {/* Quality readings or Fixed Rate */}
          {calcMode === 'CHART' ? (
            <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">FAT (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="2.0"
                  max="14.0"
                  value={fat}
                  onChange={e => setFat(e.target.value)}
                  className="w-full text-sm font-semibold px-3 py-2 bg-white border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#167A45]"
                  required
                />
              </div>
            </div>
          ) : (
            <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200">
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Rate per Litre ({settings.currencySymbol})
              </label>
              <input
                type="number"
                step="0.25"
                min="0"
                value={fixedRate}
                onChange={e => setFixedRate(e.target.value)}
                className="w-full text-sm font-semibold px-3 py-2 bg-white border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#167A45]"
                required
              />
            </div>
          )}

          {/* Live Calculated Totals Banner */}
          <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 text-white p-4 rounded-2xl shadow-sm flex items-center justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold">
                Rate: {settings.currencySymbol}{calculatedRate.toFixed(2)} / L
              </div>
              <div className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1">
                <span>{settings.currencySymbol}</span>
                <span>{calculatedTotal.toFixed(2)}</span>
              </div>
            </div>
            <div className="text-right text-xs text-neutral-300">
              <div>{parseFloat(quantity || '0').toFixed(2)} L</div>
              <div className="text-[10px] text-emerald-400 font-medium">Intake to Ledger</div>
            </div>
          </div>

          {/* Optional Note */}
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1">Remarks / Note (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Can #3, special morning delivery"
              value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#167A45]"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-neutral-300 text-neutral-700 font-bold text-sm rounded-xl hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-[#167A45] hover:bg-[#13683a] text-white font-bold text-sm rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              Save Milk Buy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
