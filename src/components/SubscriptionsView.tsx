import React, { useState } from 'react';
import { Subscription, MilkType } from '../types';
import { useDairyStore } from '../data/storage';
import {
  Calendar,
  Plus,
  Play,
  Pause,
  Clock,
  User,
  X,
  Check,
  Droplets
} from 'lucide-react';

export const SubscriptionsView: React.FC = () => {
  const store = useDairyStore();
  const settings = store.getSettings();
  const customers = store.getCustomers().filter(c => c.active);
  const subscriptions = store.getSubscriptions();

  const [showAddModal, setShowAddModal] = useState(false);
  const [customerId, setCustomerId] = useState(customers[0]?.id || '');
  const [shift, setShift] = useState<'AM' | 'PM' | 'BOTH'>('AM');
  const [quantity, setQuantity] = useState('2.0');
  const [milkType, setMilkType] = useState<MilkType>('COW');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAddSubscription = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!customerId) {
      setError('Please select a customer');
      return;
    }
    const q = parseFloat(quantity);
    if (isNaN(q) || q <= 0) {
      setError('Quantity must be greater than zero');
      return;
    }

    store.saveSubscription({
      customerId,
      shift,
      quantityLitres: q.toFixed(2),
      milkType,
      active: true,
      startDate: new Date().toISOString().split('T')[0],
      notes: notes.trim()
    });

    setShowAddModal(false);
    setNotes('');
  };

  const handleToggle = (id: string) => {
    store.toggleSubscription(id);
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-neutral-900 tracking-tight">Recurring Subscriptions</h2>
          <p className="text-xs text-neutral-500">Customer daily milk schedules & doorstep delivery plan</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#167A45] hover:bg-[#13683a] text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Plan
        </button>
      </div>

      {/* Subscription List */}
      <div className="space-y-2.5">
        {subscriptions.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-neutral-200 text-neutral-500 text-xs">
            No subscriptions set up. Add recurring daily milk delivery plans for customers!
          </div>
        ) : (
          subscriptions.map(sub => {
            const customer = customers.find(c => c.id === sub.customerId);
            return (
              <div
                key={sub.id}
                className={`bg-white rounded-2xl p-4 border transition-all ${
                  sub.active
                    ? 'border-neutral-200 shadow-2xs'
                    : 'border-neutral-200/60 opacity-60 bg-neutral-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-neutral-900">
                        {customer ? customer.name : 'Unknown Customer'}
                      </h3>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          sub.active ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-200 text-neutral-700'
                        }`}
                      >
                        {sub.active ? 'Active' : 'Paused / On Leave'}
                      </span>
                    </div>

                    <div className="text-xs text-neutral-500 flex items-center gap-2">
                      <span className="font-bold text-neutral-800 font-mono">
                        {parseFloat(sub.quantityLitres).toFixed(2)} Litres
                      </span>
                      <span>·</span>
                      <span className="font-semibold text-neutral-700">{sub.milkType} Milk</span>
                      <span>·</span>
                      <span className="text-emerald-800 font-semibold">
                        {sub.shift === 'BOTH' ? '🌅 Morning & 🌙 Evening' : sub.shift === 'AM' ? '🌅 Morning Only' : '🌙 Evening Only'}
                      </span>
                    </div>

                    {customer?.address && (
                      <div className="text-[11px] text-neutral-400">
                        📍 {customer.address}
                      </div>
                    )}
                    {sub.notes && (
                      <div className="text-[11px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md inline-block">
                        Note: {sub.notes}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleToggle(sub.id)}
                    className={`py-1.5 px-3 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                      sub.active
                        ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                        : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                    }`}
                  >
                    {sub.active ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    {sub.active ? 'Pause' : 'Resume'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Subscription Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-neutral-200">
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className="font-bold text-sm text-neutral-900">New Milk Subscription</h3>
              <button onClick={() => setShowAddModal(false)} className="cursor-pointer text-neutral-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubscription} className="space-y-3 pt-3">
              {error && <div className="text-xs text-red-600 bg-red-50 p-2 rounded-lg">{error}</div>}

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Customer</label>
                <select
                  value={customerId}
                  onChange={e => setCustomerId(e.target.value)}
                  className="w-full text-xs px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#167A45]"
                  required
                >
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.address ? `(${c.address})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Shift</label>
                <select
                  value={shift}
                  onChange={e => setShift(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#167A45]"
                >
                  <option value="AM">Morning (AM) Only</option>
                  <option value="PM">Evening (PM) Only</option>
                  <option value="BOTH">Both AM & PM</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Daily Litres</label>
                <input
                  type="number"
                  step="0.25"
                  value={quantity}
                  onChange={e => setQuantity(e.target.value)}
                  className="w-full text-xs px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#167A45]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Milk Type</label>
                <select
                  value={milkType}
                  onChange={e => setMilkType(e.target.value as MilkType)}
                  className="w-full text-xs px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#167A45]"
                >
                  <option value="COW">Cow Milk</option>
                  <option value="BUFFALO">Buffalo Milk</option>
                  <option value="MIXED">Mixed Milk</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Delivery Instruction</label>
                <input
                  type="text"
                  placeholder="e.g. Leave at front door bag, ring bell"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full text-xs px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#167A45]"
                />
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
                  Save Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
