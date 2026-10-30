import React, { useState, useEffect } from 'react';
import { PaymentType, PaymentMethod, Payment } from '../types';
import { useDairyStore } from '../data/storage';
import { X, Check, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

interface PaymentModalProps {
  onClose: () => void;
  onSuccess: (payment: Payment) => void;
  initialType?: PaymentType;
  initialPartyId?: string;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  onClose,
  onSuccess,
  initialType = 'CUSTOMER_RECEIPT',
  initialPartyId
}) => {
  const store = useDairyStore();
  const settings = store.getSettings();
  const farmers = store.getFarmers().filter(f => f.active);
  const customers = store.getCustomers().filter(c => c.active);

  const [paymentType, setPaymentType] = useState<PaymentType>(initialType);
  const [partyId, setPartyId] = useState<string>(
    initialPartyId || (initialType === 'CUSTOMER_RECEIPT' ? customers[0]?.id || '' : farmers[0]?.id || '')
  );
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState('500');
  const [method, setMethod] = useState<PaymentMethod>('UPI');
  const [reference, setReference] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Switch party list when paymentType changes
  useEffect(() => {
    if (paymentType === 'CUSTOMER_RECEIPT') {
      if (!customers.some(c => c.id === partyId)) {
        setPartyId(customers[0]?.id || '');
      }
    } else {
      if (!farmers.some(f => f.id === partyId)) {
        setPartyId(farmers[0]?.id || '');
      }
    }
  }, [paymentType]);

  // Current balance of selected party
  const balanceInfo =
    paymentType === 'CUSTOMER_RECEIPT'
      ? partyId
        ? store.getCustomerBalance(partyId)
        : null
      : partyId
      ? store.getFarmerBalance(partyId)
      : null;

  const currentDue = balanceInfo ? balanceInfo.balanceDue : 0;

  const handleQuickAmount = (val: number) => {
    setAmount(val.toFixed(2));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!partyId) {
      setError('Please select a party');
      return;
    }

    const amtNum = parseFloat(amount);
    if (isNaN(amtNum) || amtNum <= 0) {
      setError('Payment amount must be greater than zero');
      return;
    }

    try {
      const created = store.addPayment({
        partyId,
        paymentType,
        paymentDate,
        amount: amtNum.toFixed(2),
        method,
        reference: reference.trim(),
        note: note.trim()
      });
      onSuccess(created);
    } catch (err: any) {
      setError(err.message || 'Failed to record payment');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-neutral-200 animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Header */}
        <div className="bg-[#167A45] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-bold text-lg">
              💵
            </div>
            <div>
              <h2 className="text-base font-bold leading-tight">Payment & Khata Entry</h2>
              <p className="text-xs text-white/80">Customer Collection · Farmer Payout · Advances</p>
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

          {/* Payment Type Selection */}
          <div className="grid grid-cols-2 gap-2 bg-neutral-100 p-1.5 rounded-xl">
            <button
              type="button"
              onClick={() => setPaymentType('CUSTOMER_RECEIPT')}
              className={`py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                paymentType === 'CUSTOMER_RECEIPT'
                  ? 'bg-[#167A45] text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4 text-emerald-300" />
              Customer Receipt
            </button>
            <button
              type="button"
              onClick={() => setPaymentType('FARMER_PAYOUT')}
              className={`py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                paymentType === 'FARMER_PAYOUT'
                  ? 'bg-amber-700 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <ArrowUpRight className="w-4 h-4 text-amber-300" />
              Farmer Payout
            </button>
          </div>

          {/* Party Selector */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
              {paymentType === 'CUSTOMER_RECEIPT' ? 'Select Customer (Khata)' : 'Select Farmer (Supplier)'}
            </label>
            <select
              value={partyId}
              onChange={e => setPartyId(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#167A45]"
              required
            >
              {paymentType === 'CUSTOMER_RECEIPT' ? (
                customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.address ? `(${c.address})` : ''}
                  </option>
                ))
              ) : (
                farmers.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.name} {f.phone ? `(${f.phone})` : ''}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Outstanding Balance Banner */}
          <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200 flex items-center justify-between">
            <span className="text-xs text-neutral-600 font-medium">
              {paymentType === 'CUSTOMER_RECEIPT' ? 'Pending Customer Due:' : 'Net Payable to Farmer:'}
            </span>
            <div className="flex items-center gap-2">
              <span className={`text-base font-extrabold ${currentDue > 0 ? (paymentType === 'CUSTOMER_RECEIPT' ? 'text-amber-700' : 'text-emerald-700') : 'text-neutral-700'}`}>
                {settings.currencySymbol}{Math.abs(currentDue).toFixed(2)}
              </span>
              {currentDue > 0 && (
                <button
                  type="button"
                  onClick={() => handleQuickAmount(currentDue)}
                  className="text-[11px] font-bold px-2 py-0.5 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 rounded-md cursor-pointer transition-colors"
                >
                  Pay Full
                </button>
              )}
            </div>
          </div>

          {/* Amount Input */}
          <div className="bg-[#E5F3E9] p-3.5 rounded-2xl border border-emerald-200">
            <label className="block text-xs font-extrabold text-[#167A45] uppercase tracking-wider mb-1">
              Amount ({settings.currencySymbol})
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-2xl font-bold text-neutral-400">
                {settings.currencySymbol}
              </span>
              <input
                type="number"
                step="1"
                min="1"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full text-2xl font-bold font-mono pl-9 pr-3 py-2 bg-white rounded-xl border border-emerald-300 focus:outline-none focus:ring-2 focus:ring-[#167A45] text-neutral-900"
                required
              />
            </div>
            {/* Quick chips */}
            <div className="flex gap-2 mt-2">
              {[200, 500, 1000, 2000].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickAmount(val)}
                  className="text-xs font-semibold px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 cursor-pointer transition-colors"
                >
                  +{settings.currencySymbol}{val}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">Method</label>
              <select
                value={method}
                onChange={e => setMethod(e.target.value as PaymentMethod)}
                className="w-full text-xs px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#167A45]"
              >
                <option value="UPI">UPI / GPay / PhonePe</option>
                <option value="CASH">Cash</option>
                <option value="BANK">Bank Transfer (NEFT/IMPS)</option>
                <option value="CHEQUE">Cheque</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">Date</label>
              <input
                type="date"
                value={paymentDate}
                onChange={e => setPaymentDate(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#167A45]"
                required
              />
            </div>
          </div>

          {/* Reference & Remarks */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">Ref / UTR / Cheque #</label>
              <input
                type="text"
                placeholder="UPI ref or slip #"
                value={reference}
                onChange={e => setReference(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#167A45]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">Note (Optional)</label>
              <input
                type="text"
                placeholder="Advance or bill settlement"
                value={note}
                onChange={e => setNote(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#167A45]"
              />
            </div>
          </div>

          {/* Action buttons */}
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
              className={`flex-1 py-3 text-white font-bold text-sm rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                paymentType === 'CUSTOMER_RECEIPT'
                  ? 'bg-[#167A45] hover:bg-[#13683a]'
                  : 'bg-amber-700 hover:bg-amber-800'
              }`}
            >
              <Check className="w-4 h-4" />
              Save Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
