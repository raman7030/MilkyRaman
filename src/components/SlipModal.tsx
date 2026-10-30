import React, { useState } from 'react';
import { MilkEntry, Payment, Farmer, Customer } from '../types';
import { useDairyStore } from '../data/storage';
import { Check, Copy, Printer, Share2, X } from 'lucide-react';

interface SlipModalProps {
  entry?: MilkEntry | null;
  payment?: Payment | null;
  onClose: () => void;
}

export const SlipModal: React.FC<SlipModalProps> = ({ entry, payment, onClose }) => {
  const store = useDairyStore();
  const settings = store.getSettings();
  const [copied, setCopied] = useState(false);

  if (!entry && !payment) return null;

  let partyName = 'Party';
  let partyPhone = '';
  let partyType = '';

  if (entry) {
    if (entry.entryType === 'FARMER_BUY') {
      const f = store.getFarmers().find(x => x.id === entry.partyId);
      partyName = f ? f.name : 'Unknown Farmer';
      partyPhone = f ? f.phone : '';
      partyType = 'Farmer (Procurement)';
    } else {
      const c = store.getCustomers().find(x => x.id === entry.partyId);
      partyName = c ? c.name : 'Unknown Customer';
      partyPhone = c ? c.phone : '';
      partyType = 'Customer (Sale)';
    }
  } else if (payment) {
    if (payment.paymentType === 'FARMER_PAYOUT') {
      const f = store.getFarmers().find(x => x.id === payment.partyId);
      partyName = f ? f.name : 'Unknown Farmer';
      partyPhone = f ? f.phone : '';
      partyType = 'Farmer Payout';
    } else {
      const c = store.getCustomers().find(x => x.id === payment.partyId);
      partyName = c ? c.name : 'Unknown Customer';
      partyPhone = c ? c.phone : '';
      partyType = 'Customer Receipt';
    }
  }

  // Generate WhatsApp / text slip representation
  const generateSlipText = () => {
    const lines = [
      `*${settings.dairyName.toUpperCase()}*`,
      `${settings.tagline || 'Pure Milk, Transparent Hisab'}`,
      `📞 ${settings.phone}`,
      `---------------------------------`,
      entry
        ? `📜 *${entry.entryType === 'FARMER_BUY' ? 'MILK PURCHASE SLIP' : 'MILK SALE SLIP'}*`
        : `💰 *PAYMENT RECEIPT*`,
      `Date: ${entry ? entry.entryDate : payment?.paymentDate} (${entry?.shift || 'Payment'})`,
      `Party: *${partyName}* (${partyType})`,
      `---------------------------------`
    ];

    if (entry) {
      lines.push(`Milk Type: ${entry.milkType}`);
      lines.push(`Quantity: ${parseFloat(entry.quantityLitres).toFixed(2)} Litres`);
      if (entry.fat) lines.push(`FAT: ${entry.fat}%`);
      lines.push(`Rate / Litre: ${settings.currencySymbol}${parseFloat(entry.ratePerLitre).toFixed(2)}`);
      lines.push(`*TOTAL AMOUNT: ${settings.currencySymbol}${parseFloat(entry.totalAmount).toFixed(2)}*`);
      if (entry.note) lines.push(`Note: ${entry.note}`);
    } else if (payment) {
      lines.push(`Payment Type: ${payment.paymentType === 'FARMER_PAYOUT' ? 'Payout to Farmer' : 'Receipt from Customer'}`);
      lines.push(`Method: ${payment.method} ${payment.reference ? `(${payment.reference})` : ''}`);
      lines.push(`*AMOUNT: ${settings.currencySymbol}${parseFloat(payment.amount).toFixed(2)}*`);
      if (payment.note) lines.push(`Note: ${payment.note}`);
    }

    lines.push(`---------------------------------`);
    lines.push(`Thank you for doing business with us!`);
    return lines.join('\n');
  };

  const slipText = generateSlipText();

  const handleCopy = () => {
    navigator.clipboard.writeText(slipText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsApp = () => {
    const encoded = encodeURIComponent(slipText);
    const cleanPhone = partyPhone.replace(/[^0-9]/g, '');
    const url = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-neutral-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#167A45] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🧾</span>
            <div>
              <h3 className="font-bold text-base leading-tight">Digital Receipt / Slip</h3>
              <p className="text-xs text-white/80">MilkyRaman Thermal Format</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable thermal receipt view */}
        <div className="p-6 bg-neutral-50/50">
          <div className="bg-white border-2 border-dashed border-neutral-300 rounded-xl p-5 shadow-xs font-mono text-xs text-neutral-800 space-y-2">
            <div className="text-center border-b border-neutral-200 pb-3">
              <div className="font-bold text-sm tracking-wide text-[#167A45]">{settings.dairyName}</div>
              <div className="text-[11px] text-neutral-500">{settings.tagline}</div>
              <div className="text-[11px] text-neutral-500">📞 {settings.phone}</div>
            </div>

            <div className="flex justify-between pt-1">
              <span className="text-neutral-500">Date & Shift:</span>
              <span className="font-semibold">{entry ? `${entry.entryDate} (${entry.shift})` : payment?.paymentDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Party:</span>
              <span className="font-semibold">{partyName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Transaction:</span>
              <span className="font-semibold text-emerald-800">
                {entry ? (entry.entryType === 'FARMER_BUY' ? 'MILK BUY' : 'MILK SELL') : payment?.paymentType}
              </span>
            </div>

            <div className="border-t border-b border-dashed border-neutral-300 py-2 my-2 space-y-1">
              {entry && (
                <>
                  <div className="flex justify-between">
                    <span>Milk Type:</span>
                    <span>{entry.milkType}</span>
                  </div>
                  <div className="flex justify-between font-bold text-neutral-900">
                    <span>Quantity:</span>
                    <span>{parseFloat(entry.quantityLitres).toFixed(2)} L</span>
                  </div>
                  {entry.fat && (
                    <div className="flex justify-between text-neutral-600">
                      <span>FAT / SNF:</span>
                      <span>{entry.fat}% / {entry.snf || '-'}%</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Rate / L:</span>
                    <span>{settings.currencySymbol}{parseFloat(entry.ratePerLitre).toFixed(2)}</span>
                  </div>
                </>
              )}

              {payment && (
                <>
                  <div className="flex justify-between">
                    <span>Method:</span>
                    <span>{payment.method}</span>
                  </div>
                  {payment.reference && (
                    <div className="flex justify-between text-neutral-500">
                      <span>Ref:</span>
                      <span>{payment.reference}</span>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex justify-between items-center text-sm font-bold text-neutral-900 pt-1">
              <span>TOTAL:</span>
              <span className="text-base text-[#167A45]">
                {settings.currencySymbol}
                {entry ? parseFloat(entry.totalAmount).toFixed(2) : parseFloat(payment?.amount || '0').toFixed(2)}
              </span>
            </div>

            <div className="text-center pt-3 text-[10px] text-neutral-400">
              * Verified by MilkyRaman Offline Dairy System *
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-white border-t border-neutral-100 flex flex-wrap gap-2">
          <button
            onClick={handleWhatsApp}
            className="flex-1 min-w-[120px] bg-[#25D366] hover:bg-[#20ba59] text-white font-medium text-xs px-3 py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors"
          >
            <Share2 className="w-4 h-4" />
            WhatsApp Slip
          </button>
          <button
            onClick={handleCopy}
            className="flex-1 min-w-[110px] bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-medium text-xs px-3 py-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy Text'}
          </button>
          <button
            onClick={handlePrint}
            className="bg-neutral-800 hover:bg-neutral-900 text-white font-medium text-xs px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
        </div>
      </div>
    </div>
  );
};
