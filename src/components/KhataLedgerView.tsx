import React, { useState } from 'react';
import { Payment, PaymentType } from '../types';
import { useDairyStore } from '../data/storage';
import {
  CreditCard,
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  Plus,
  Receipt,
  UserCheck,
  Users
} from 'lucide-react';

interface KhataLedgerViewProps {
  onOpenPaymentModal: (type: PaymentType, partyId?: string) => void;
  onViewSlip: (payment: Payment) => void;
}

export const KhataLedgerView: React.FC<KhataLedgerViewProps> = ({
  onOpenPaymentModal,
  onViewSlip
}) => {
  const store = useDairyStore();
  const settings = store.getSettings();
  const customers = store.getCustomers();
  const farmers = store.getFarmers();
  const payments = store.getPayments();

  const [activeTab, setActiveTab] = useState<'CUSTOMERS' | 'FARMERS' | 'HISTORY'>('CUSTOMERS');
  const [searchTerm, setSearchTerm] = useState('');

  // Summaries
  let totalCustomerReceivable = 0;
  let totalFarmerPayable = 0;

  customers.forEach(c => {
    const b = store.getCustomerBalance(c.id);
    if (b.balanceDue > 0) totalCustomerReceivable += b.balanceDue;
  });

  farmers.forEach(f => {
    const b = store.getFarmerBalance(f.id);
    if (b.balanceDue > 0) totalFarmerPayable += b.balanceDue;
  });

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredFarmers = farmers.filter(f =>
    f.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredPayments = payments.filter(p => {
    const partyName =
      p.paymentType === 'CUSTOMER_RECEIPT'
        ? customers.find(c => c.id === p.partyId)?.name || ''
        : farmers.find(f => f.id === p.partyId)?.name || '';
    return (
      partyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.method.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.reference && p.reference.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  return (
    <div className="space-y-4 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-neutral-900 tracking-tight">Payments & Khata</h2>
          <p className="text-xs text-neutral-500">Party ledgers, customer receipts and farmer payouts</p>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => onOpenPaymentModal('CUSTOMER_RECEIPT')}
            className="bg-[#167A45] hover:bg-[#13683a] text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1 shadow-xs cursor-pointer transition-colors"
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            Receipt
          </button>
          <button
            onClick={() => onOpenPaymentModal('FARMER_PAYOUT')}
            className="bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1 shadow-xs cursor-pointer transition-colors"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            Payout
          </button>
        </div>
      </div>

      {/* Top Ledger Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div
          onClick={() => setActiveTab('CUSTOMERS')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'CUSTOMERS'
              ? 'bg-emerald-50/70 border-emerald-400 shadow-xs'
              : 'bg-white border-neutral-200'
          }`}
        >
          <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-bold">
            <ArrowDownLeft className="w-4 h-4" />
            <span>Customer Dues (Receivable)</span>
          </div>
          <div className="text-xl font-black text-emerald-950 mt-1">
            {settings.currencySymbol}
            {totalCustomerReceivable.toFixed(2)}
          </div>
          <div className="text-[11px] text-neutral-500 mt-0.5">
            Pending collection from households
          </div>
        </div>

        <div
          onClick={() => setActiveTab('FARMERS')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'FARMERS'
              ? 'bg-amber-50/70 border-amber-400 shadow-xs'
              : 'bg-white border-neutral-200'
          }`}
        >
          <div className="flex items-center gap-1.5 text-amber-800 text-xs font-bold">
            <ArrowUpRight className="w-4 h-4" />
            <span>Farmer Dues (Payable)</span>
          </div>
          <div className="text-xl font-black text-amber-950 mt-1">
            {settings.currencySymbol}
            {totalFarmerPayable.toFixed(2)}
          </div>
          <div className="text-[11px] text-neutral-500 mt-0.5">
            Disbursements owed to milk suppliers
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex bg-neutral-200/80 p-1 rounded-2xl">
        <button
          onClick={() => setActiveTab('CUSTOMERS')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'CUSTOMERS' ? 'bg-white text-[#167A45] shadow-xs' : 'text-neutral-600'
          }`}
        >
          Customer Khata ({customers.length})
        </button>
        <button
          onClick={() => setActiveTab('FARMERS')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'FARMERS' ? 'bg-white text-amber-800 shadow-xs' : 'text-neutral-600'
          }`}
        >
          Farmer Khata ({farmers.length})
        </button>
        <button
          onClick={() => setActiveTab('HISTORY')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'HISTORY' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600'
          }`}
        >
          Payment History ({payments.length})
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
        <input
          type="text"
          placeholder="Filter by name, reference or method..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full text-xs pl-9 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#167A45]"
        />
      </div>

      {/* Content depending on selected tab */}
      {activeTab === 'CUSTOMERS' && (
        <div className="space-y-2">
          {filteredCustomers.map(cust => {
            const bal = store.getCustomerBalance(cust.id);
            return (
              <div
                key={cust.id}
                className="bg-white rounded-2xl p-3.5 border border-neutral-200/90 shadow-2xs flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-sm text-neutral-900">{cust.name}</h4>
                  <div className="text-xs text-neutral-500 font-mono">
                    Total Billed: {settings.currencySymbol}{bal.totalReceivable.toFixed(0)} · Paid: {settings.currencySymbol}{bal.totalReceived.toFixed(0)}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-semibold text-neutral-400">Balance</span>
                    <div
                      className={`text-sm font-black ${
                        bal.balanceDue > 0 ? 'text-amber-700' : 'text-emerald-700'
                      }`}
                    >
                      {settings.currencySymbol}{bal.balanceDue.toFixed(2)}
                    </div>
                  </div>

                  <button
                    onClick={() => onOpenPaymentModal('CUSTOMER_RECEIPT', cust.id)}
                    className="py-1.5 px-3 bg-[#E5F3E9] hover:bg-[#d8edd0] text-[#167A45] font-bold text-xs rounded-xl cursor-pointer transition-colors"
                  >
                    Receive
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'FARMERS' && (
        <div className="space-y-2">
          {filteredFarmers.map(farmer => {
            const bal = store.getFarmerBalance(farmer.id);
            return (
              <div
                key={farmer.id}
                className="bg-white rounded-2xl p-3.5 border border-neutral-200/90 shadow-2xs flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-sm text-neutral-900">{farmer.name}</h4>
                  <div className="text-xs text-neutral-500 font-mono">
                    Total Supplies: {settings.currencySymbol}{bal.totalPayable.toFixed(0)} · Paid: {settings.currencySymbol}{bal.totalPaid.toFixed(0)}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-semibold text-neutral-400">Net Due</span>
                    <div
                      className={`text-sm font-black ${
                        bal.balanceDue > 0 ? 'text-amber-700' : 'text-neutral-700'
                      }`}
                    >
                      {settings.currencySymbol}{bal.balanceDue.toFixed(2)}
                    </div>
                  </div>

                  <button
                    onClick={() => onOpenPaymentModal('FARMER_PAYOUT', farmer.id)}
                    className="py-1.5 px-3 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs rounded-xl border border-amber-200 cursor-pointer transition-colors"
                  >
                    Payout
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'HISTORY' && (
        <div className="space-y-2">
          {filteredPayments.map(p => {
            const partyName =
              p.paymentType === 'CUSTOMER_RECEIPT'
                ? customers.find(c => c.id === p.partyId)?.name || 'Customer'
                : farmers.find(f => f.id === p.partyId)?.name || 'Farmer';

            const isReceipt = p.paymentType === 'CUSTOMER_RECEIPT';

            return (
              <div
                key={p.id}
                onClick={() => onViewSlip(p)}
                className="bg-white hover:bg-neutral-50 rounded-2xl p-3.5 border border-neutral-200/90 shadow-2xs flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isReceipt ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {isReceipt ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-neutral-900">{partyName}</h4>
                    <div className="text-xs text-neutral-500">
                      {p.paymentDate} · {p.method} {p.reference ? `(${p.reference})` : ''}
                      {p.note ? ` · ${p.note}` : ''}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={`text-sm font-black font-mono ${
                      isReceipt ? 'text-emerald-700' : 'text-amber-800'
                    }`}
                  >
                    {isReceipt ? '+' : '-'}{settings.currencySymbol}{parseFloat(p.amount).toFixed(2)}
                  </div>
                  <span className="text-[10px] text-neutral-400 font-medium">Click for Slip</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
