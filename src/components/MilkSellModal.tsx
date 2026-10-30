import React, { useState, useEffect } from 'react';
import { MilkType, ShiftType, Customer, MilkEntry } from '../types';
import { useDairyStore } from '../data/storage';
import { MilkPricing } from '../domain/pricing';
import { X, UserPlus, Check, ShoppingBag } from 'lucide-react';

interface MilkSellModalProps {
  onClose: () => void;
  onSuccess: (savedEntry: MilkEntry) => void;
}

export const MilkSellModal: React.FC<MilkSellModalProps> = ({ onClose, onSuccess }) => {
  const store = useDairyStore();
  const settings = store.getSettings();
  const customers = store.getCustomers().filter(c => c.active);

  const [customerId, setCustomerId] = useState(customers[0]?.id || '');
  const [entryDate, setEntryDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [shift, setShift] = useState<ShiftType>(() => (new Date().getHours() < 14 ? 'AM' : 'PM'));
  const [milkType, setMilkType] = useState<MilkType>('COW');
  const [quantity, setQuantity] = useState('2.0');
  const [ratePerLitre, setRatePerLitre] = useState('60.00');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Quick inline add customer
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [newCustRate, setNewCustRate] = useState('62.00');

  // When customer changes, load their specific negotiated default rate
  useEffect(() => {
    const cust = customers.find(c => c.id === customerId);
    if (cust && cust.defaultRate) {
      setRatePerLitre(cust.defaultRate);
    }
  }, [customerId]);

  const qtyNum = parseFloat(quantity) || 0;
  const rateNum = parseFloat(ratePerLitre) || 0;
  let calculatedRate = rateNum;
  let calculatedTotal = 0;
  try {
    if (qtyNum > 0 && rateNum >= 0) {
      const calc = MilkPricing.fixedRate(qtyNum, rateNum);
      calculatedRate = calc.ratePerLitre;
      calculatedTotal = calc.total;
    }
  } catch (err: any) {
    // ignore in-flight typing errors
  }

  const handleQuickAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim()) return;
    const created = store.addCustomer({
      name: newCustName.trim(),
      phone: newCustPhone.trim(),
      address: newCustAddress.trim(),
      defaultRate: newCustRate || '60.00',
      active: true
    });
    setCustomerId(created.id);
    setRatePerLitre(created.defaultRate);
    setShowAddCustomer(false);
    setNewCustName('');
    setNewCustPhone('');
    setNewCustAddress('');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!customerId) {
      setError('Please select or register a customer');
      return;
    }

    if (isNaN(qtyNum) || qtyNum <= 0) {
      setError('Quantity must be greater than zero');
      return;
    }

    if (isNaN(rateNum) || rateNum < 0) {
      setError('Please enter a valid rate');
      return;
    }

    try {
      const entry = store.addMilkEntry({
        partyId: customerId,
        entryType: 'CUSTOMER_SELL',
        entryDate,
        shift,
        milkType,
        quantityLitres: qtyNum.toFixed(2),
        fat: null,
        snf: null,
        ratePerLitre: calculatedRate.toFixed(2),
        totalAmount: calculatedTotal.toFixed(2),
        note: note.trim()
      });
      onSuccess(entry);
    } catch (err: any) {
      setError(err.message || 'Failed to save sale');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-neutral-200 animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Modal Header */}
        <div className="bg-[#167A45] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-bold text-lg">
              🛍️
            </div>
            <div>
              <h2 className="text-base font-bold leading-tight">Milk Sell (Retail & Khata)</h2>
              <p className="text-xs text-white/80">Household & Shop Sales · Immediate Ledger Impact</p>
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

          {/* Customer Selection or Inline Creation */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider">Customer / Buyer</label>
              <button
                type="button"
                onClick={() => setShowAddCustomer(!showAddCustomer)}
                className="text-xs font-semibold text-[#167A45] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                {showAddCustomer ? 'Cancel' : '+ New Customer'}
              </button>
            </div>

            {showAddCustomer ? (
              <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2 mb-2">
                <input
                  type="text"
                  placeholder="Customer Full Name (e.g. Sharma Niwas)"
                  value={newCustName}
                  onChange={e => setNewCustName(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#167A45]"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="tel"
                    placeholder="Mobile / Phone"
                    value={newCustPhone}
                    onChange={e => setNewCustPhone(e.target.value)}
                    className="text-xs px-3 py-2 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#167A45]"
                  />
                  <input
                    type="number"
                    step="0.5"
                    placeholder="Rate / L (₹)"
                    value={newCustRate}
                    onChange={e => setNewCustRate(e.target.value)}
                    className="text-xs px-3 py-2 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#167A45]"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Address / Flat / Colony"
                  value={newCustAddress}
                  onChange={e => setNewCustAddress(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#167A45]"
                />
                <button
                  type="button"
                  onClick={handleQuickAddCustomer}
                  className="w-full bg-[#167A45] text-white text-xs py-2 rounded-lg font-semibold hover:bg-[#13683a] cursor-pointer"
                >
                  Save & Select Customer
                </button>
              </div>
            ) : (
              <select
                value={customerId}
                onChange={e => setCustomerId(e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#167A45]"
                required
              >
                {customers.length === 0 && <option value="">No active customers. Add one!</option>}
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.address ? `(${c.address})` : ''} — Custom Rate: {settings.currencySymbol}{c.defaultRate}/L
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

          {/* Milk Type & Rate */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">Milk Variety</label>
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
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Rate / Litre ({settings.currencySymbol})
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={ratePerLitre}
                onChange={e => setRatePerLitre(e.target.value)}
                className="w-full text-xs font-bold px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#167A45]"
                required
              />
            </div>
          </div>

          {/* Quantity Input */}
          <div className="bg-[#E5F3E9] p-3.5 rounded-2xl border border-emerald-200">
            <label className="block text-xs font-extrabold text-[#167A45] uppercase tracking-wider mb-1">
              Quantity Sold (Litres)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.25"
                min="0.1"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                className="w-full text-2xl font-bold font-mono px-3 py-2 bg-white rounded-xl border border-emerald-300 focus:outline-none focus:ring-2 focus:ring-[#167A45] text-neutral-900"
                required
              />
              <span className="absolute right-3.5 top-2.5 font-bold text-neutral-400 text-sm">LITRES</span>
            </div>
          </div>

          {/* Calculated Total Bar */}
          <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 text-white p-4 rounded-2xl shadow-sm flex items-center justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold">
                Bill Amount ({settings.currencySymbol}{calculatedRate.toFixed(2)}/L)
              </div>
              <div className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1">
                <span>{settings.currencySymbol}</span>
                <span>{calculatedTotal.toFixed(2)}</span>
              </div>
            </div>
            <div className="text-right text-xs text-neutral-300">
              <div>{parseFloat(quantity || '0').toFixed(2)} L</div>
              <div className="text-[10px] text-emerald-400 font-medium">Added to Customer Due</div>
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1">Note / Delivery Remark</label>
            <input
              type="text"
              placeholder="e.g. Extra morning bottle, cash counter sale"
              value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#167A45]"
            />
          </div>

          {/* Buttons */}
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
              Save Milk Sale
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
