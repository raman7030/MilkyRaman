import React, { useState } from 'react';
import { ShiftType } from '../types';
import { useDairyStore } from '../data/storage';
import {
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  CheckCheck,
  Calendar,
  AlertCircle
} from 'lucide-react';

export const DeliveryView: React.FC = () => {
  const store = useDairyStore();
  const settings = store.getSettings();
  const customers = store.getCustomers();
  const subscriptions = store.getSubscriptions().filter(s => s.active);

  const [shift, setShift] = useState<ShiftType>(() => (new Date().getHours() < 14 ? 'AM' : 'PM'));
  const today = new Date().toISOString().split('T')[0];

  // Check which deliveries have already been posted as sales today
  const todaySales = store.getMilkEntries().filter(
    e => e.entryType === 'CUSTOMER_SELL' && e.entryDate === today && e.shift === shift
  );

  // Subscriptions eligible for this shift
  const routeItems = subscriptions.filter(s => s.shift === 'BOTH' || s.shift === shift);

  // Delivery status state per subscription id: 'DELIVERED' | 'SKIPPED' | 'PENDING'
  const [statuses, setStatuses] = useState<Record<string, 'DELIVERED' | 'SKIPPED' | 'PENDING'>>({});

  const getStatus = (subId: string, custId: string) => {
    if (statuses[subId]) return statuses[subId];
    // Check if a sale already exists for this customer today
    const exists = todaySales.some(e => e.partyId === custId);
    return exists ? 'DELIVERED' : 'PENDING';
  };

  const handleMarkDelivered = (sub: typeof routeItems[0]) => {
    const cust = customers.find(c => c.id === sub.customerId);
    if (!cust) return;

    // Check if already posted
    const alreadyPosted = todaySales.some(e => e.partyId === cust.id);
    if (!alreadyPosted) {
      const rate = parseFloat(cust.defaultRate) || 60;
      const qty = parseFloat(sub.quantityLitres) || 1;
      const total = (rate * qty).toFixed(2);

      store.addMilkEntry({
        partyId: cust.id,
        entryType: 'CUSTOMER_SELL',
        entryDate: today,
        shift,
        milkType: sub.milkType,
        quantityLitres: sub.quantityLitres,
        fat: null,
        snf: null,
        ratePerLitre: rate.toFixed(2),
        totalAmount: total,
        note: `Route delivery (${shift})`
      });
    }

    setStatuses(prev => ({ ...prev, [sub.id]: 'DELIVERED' }));
  };

  const handleMarkSkipped = (subId: string) => {
    setStatuses(prev => ({ ...prev, [subId]: 'SKIPPED' }));
  };

  const handleMarkAllDelivered = () => {
    routeItems.forEach(sub => {
      const cust = customers.find(c => c.id === sub.customerId);
      if (cust) {
        handleMarkDelivered(sub);
      }
    });
  };

  const deliveredCount = routeItems.filter(s => getStatus(s.id, s.customerId) === 'DELIVERED').length;
  const skippedCount = routeItems.filter(s => getStatus(s.id, s.customerId) === 'SKIPPED').length;
  const pendingCount = routeItems.length - deliveredCount - skippedCount;

  const totalLitres = routeItems.reduce((acc, s) => acc + (parseFloat(s.quantityLitres) || 0), 0);

  return (
    <div className="space-y-4 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-neutral-900 tracking-tight">Delivery Route Sheet</h2>
          <p className="text-xs text-neutral-500">Morning & evening doorstep drop list</p>
        </div>

        {/* Shift selector */}
        <div className="flex bg-neutral-200/80 p-1 rounded-xl">
          <button
            onClick={() => setShift('AM')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              shift === 'AM' ? 'bg-[#167A45] text-white shadow-xs' : 'text-neutral-600'
            }`}
          >
            🌅 AM Route
          </button>
          <button
            onClick={() => setShift('PM')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              shift === 'PM' ? 'bg-[#167A45] text-white shadow-xs' : 'text-neutral-600'
            }`}
          >
            🌙 PM Route
          </button>
        </div>
      </div>

      {/* Progress Card */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-neutral-700">
            Route Progress: {deliveredCount} / {routeItems.length} Stops Delivered
          </span>
          <span className="font-mono text-neutral-500 font-semibold">
            Load: {totalLitres.toFixed(1)} Litres
          </span>
        </div>

        <div className="w-full bg-neutral-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-[#167A45] h-full transition-all duration-300"
            style={{
              width: `${routeItems.length > 0 ? (deliveredCount / routeItems.length) * 100 : 0}%`
            }}
          />
        </div>

        {pendingCount > 0 && (
          <div className="flex justify-end pt-1">
            <button
              onClick={handleMarkAllDelivered}
              className="text-xs font-bold text-[#167A45] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all {pendingCount} pending as delivered
            </button>
          </div>
        )}
      </div>

      {/* Delivery Items */}
      <div className="space-y-2">
        {routeItems.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-neutral-200 text-neutral-500 text-xs">
            No active delivery subscriptions found for {shift} shift.
          </div>
        ) : (
          routeItems.map((sub, idx) => {
            const cust = customers.find(c => c.id === sub.customerId);
            const status = getStatus(sub.id, sub.customerId);

            return (
              <div
                key={sub.id}
                className={`bg-white rounded-2xl p-3.5 border transition-all flex items-center justify-between ${
                  status === 'DELIVERED'
                    ? 'border-emerald-300 bg-emerald-50/20'
                    : status === 'SKIPPED'
                    ? 'border-neutral-300 bg-neutral-100/60 opacity-60'
                    : 'border-neutral-200 shadow-2xs'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                      status === 'DELIVERED'
                        ? 'bg-[#167A45] text-white'
                        : status === 'SKIPPED'
                        ? 'bg-neutral-300 text-neutral-700'
                        : 'bg-neutral-100 text-neutral-700'
                    }`}
                  >
                    {idx + 1}
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-neutral-900">{cust?.name}</h4>
                    {cust?.address && (
                      <p className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-neutral-400" />
                        <span>{cust.address}</span>
                      </p>
                    )}
                    {sub.notes && (
                      <p className="text-[11px] text-amber-800 italic mt-0.5">
                        Note: {sub.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right mr-1">
                    <span className="text-xs font-black font-mono text-neutral-900">
                      {parseFloat(sub.quantityLitres).toFixed(1)} L
                    </span>
                    <div className="text-[10px] text-neutral-400 uppercase font-semibold">
                      {sub.milkType}
                    </div>
                  </div>

                  {status === 'DELIVERED' ? (
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 bg-emerald-100 px-2.5 py-1 rounded-lg">
                      <CheckCircle2 className="w-4 h-4" />
                      Done
                    </span>
                  ) : status === 'SKIPPED' ? (
                    <span className="text-xs font-semibold text-neutral-500 bg-neutral-200 px-2.5 py-1 rounded-lg">
                      Skipped
                    </span>
                  ) : (
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleMarkDelivered(sub)}
                        className="py-1.5 px-3 bg-[#167A45] hover:bg-[#13683a] text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-2xs"
                      >
                        Deliver
                      </button>
                      <button
                        onClick={() => handleMarkSkipped(sub.id)}
                        className="py-1.5 px-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 text-xs font-semibold rounded-lg cursor-pointer"
                        title="Skip for today"
                      >
                        Skip
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
