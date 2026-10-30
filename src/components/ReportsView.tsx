import React, { useState } from 'react';
import { useDairyStore } from '../data/storage';
import {
  Receipt,
  Download,
  Printer,
  Calendar,
  TrendingUp,
  DollarSign,
  ArrowDownLeft,
  ArrowUpRight,
  FileSpreadsheet
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const store = useDairyStore();
  const settings = store.getSettings();
  const entries = store.getMilkEntries();
  const payments = store.getPayments();
  const expenses = store.getExpenses();
  const customers = store.getCustomers();
  const farmers = store.getFarmers();

  const [period, setPeriod] = useState<'TODAY' | 'WEEK' | 'MONTH' | 'ALL'>('TODAY');

  const todayStr = new Date().toISOString().split('T')[0];

  const filterByPeriod = (dateStr: string) => {
    if (period === 'ALL') return true;
    if (period === 'TODAY') return dateStr === todayStr;

    const entryTime = new Date(dateStr).getTime();
    const now = new Date().getTime();

    if (period === 'WEEK') {
      return now - entryTime <= 7 * 86400000;
    }
    if (period === 'MONTH') {
      return now - entryTime <= 30 * 86400000;
    }
    return true;
  };

  const periodEntries = entries.filter(e => filterByPeriod(e.entryDate));
  const periodPayments = payments.filter(p => filterByPeriod(p.paymentDate));
  const periodExpenses = expenses.filter(e => filterByPeriod(e.expenseDate));

  // Procurement
  const procurementEntries = periodEntries.filter(e => e.entryType === 'FARMER_BUY');
  const litresProcured = procurementEntries.reduce((s, e) => s + (parseFloat(e.quantityLitres) || 0), 0);
  const procurementCost = procurementEntries.reduce((s, e) => s + (parseFloat(e.totalAmount) || 0), 0);

  // Sales
  const salesEntries = periodEntries.filter(e => e.entryType === 'CUSTOMER_SELL');
  const litresSold = salesEntries.reduce((s, e) => s + (parseFloat(e.quantityLitres) || 0), 0);
  const salesRevenue = salesEntries.reduce((s, e) => s + (parseFloat(e.totalAmount) || 0), 0);

  // Expenses
  const totalExpenses = periodExpenses.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);

  // Profitability
  const grossMargin = salesRevenue - procurementCost;
  const netProfit = grossMargin - totalExpenses;

  // Cash collections & payouts
  const cashCollected = periodPayments
    .filter(p => p.paymentType === 'CUSTOMER_RECEIPT')
    .reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);

  const farmerDisbursed = periodPayments
    .filter(p => p.paymentType === 'FARMER_PAYOUT')
    .reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);

  // Customer dues & Farmer dues
  let totalReceivable = 0;
  customers.forEach(c => {
    const b = store.getCustomerBalance(c.id);
    if (b.balanceDue > 0) totalReceivable += b.balanceDue;
  });

  let totalPayable = 0;
  farmers.forEach(f => {
    const b = store.getFarmerBalance(f.id);
    if (b.balanceDue > 0) totalPayable += b.balanceDue;
  });

  // CSV Export
  const handleExportCSV = () => {
    const rows: string[][] = [
      ['Date', 'Type', 'Party', 'Shift', 'Milk Type', 'Litres', 'FAT', 'Rate', 'Total Amount']
    ];

    entries.forEach(e => {
      const party =
        e.entryType === 'FARMER_BUY'
          ? farmers.find(f => f.id === e.partyId)?.name || 'Farmer'
          : customers.find(c => c.id === e.partyId)?.name || 'Customer';
      rows.push([
        e.entryDate,
        e.entryType,
        `"${party}"`,
        e.shift,
        e.milkType,
        e.quantityLitres,
        e.fat || '',
        e.ratePerLitre,
        e.totalAmount
      ]);
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(r => r.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MilkyRaman_Report_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-neutral-900 tracking-tight">Day Book & Reports</h2>
          <p className="text-xs text-neutral-500">Business overview, gross margin and statement exports</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="bg-[#167A45] hover:bg-[#13683a] text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
          <button
            onClick={() => window.print()}
            className="bg-neutral-800 hover:bg-neutral-900 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Print
          </button>
        </div>
      </div>

      {/* Period Filter Strip */}
      <div className="flex bg-neutral-200/80 p-1 rounded-2xl max-w-sm">
        {(['TODAY', 'WEEK', 'MONTH', 'ALL'] as const).map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              period === p ? 'bg-white text-[#167A45] shadow-xs' : 'text-neutral-600'
            }`}
          >
            {p === 'TODAY' ? 'Today' : p === 'WEEK' ? '7 Days' : p === 'MONTH' ? '30 Days' : 'All Time'}
          </button>
        ))}
      </div>

      {/* Net Profit Summary Card */}
      <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 text-white rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
              ESTIMATED NET OPERATING PROFIT
            </span>
            <div className={`text-3xl font-black mt-0.5 ${netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {settings.currencySymbol}{netProfit.toFixed(2)}
            </div>
          </div>
          <div className="p-3 bg-white/10 rounded-2xl">
            <TrendingUp className="w-6 h-6 text-emerald-400" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/15 text-xs">
          <div>
            <div className="text-[10px] text-neutral-400 font-semibold uppercase">Gross Sales</div>
            <div className="font-bold font-mono text-white">
              {settings.currencySymbol}{salesRevenue.toFixed(0)}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-neutral-400 font-semibold uppercase">Procurement</div>
            <div className="font-bold font-mono text-neutral-300">
              {settings.currencySymbol}{procurementCost.toFixed(0)}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-neutral-400 font-semibold uppercase">Expenses</div>
            <div className="font-bold font-mono text-neutral-300">
              {settings.currencySymbol}{totalExpenses.toFixed(0)}
            </div>
          </div>
        </div>
      </div>

      {/* Volume Balance: Procurement vs Sales */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-2xs space-y-3">
        <h3 className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
          Milk Volume Flow ({period})
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
            <div className="text-[11px] font-bold text-emerald-800 uppercase">Litres Procured</div>
            <div className="text-xl font-black text-emerald-950 font-mono mt-0.5">
              {litresProcured.toFixed(1)} L
            </div>
            <div className="text-[11px] text-emerald-700 mt-0.5">
              Cost: {settings.currencySymbol}{procurementCost.toFixed(0)} (avg {litresProcured > 0 ? (procurementCost / litresProcured).toFixed(1) : 0}/L)
            </div>
          </div>

          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100">
            <div className="text-[11px] font-bold text-blue-800 uppercase">Litres Sold</div>
            <div className="text-xl font-black text-blue-950 font-mono mt-0.5">
              {litresSold.toFixed(1)} L
            </div>
            <div className="text-[11px] text-blue-700 mt-0.5">
              Billed: {settings.currencySymbol}{salesRevenue.toFixed(0)} (avg {litresSold > 0 ? (salesRevenue / litresSold).toFixed(1) : 0}/L)
            </div>
          </div>
        </div>

        {/* Litres conversion / retention */}
        <div className="text-xs text-neutral-500 font-medium pt-1 flex justify-between items-center border-t border-neutral-100">
          <span>Processed / Retained for Value Products:</span>
          <span className="font-bold text-neutral-800 font-mono">
            {Math.max(0, litresProcured - litresSold).toFixed(1)} Litres
          </span>
        </div>
      </div>

      {/* Cash Flow in Hand */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-2xs space-y-3">
        <h3 className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
          Cash & Bank Movements ({period})
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-[#F6F8F6] rounded-xl border border-neutral-200">
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 uppercase">
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>Payments Collected</span>
            </div>
            <div className="text-xl font-black text-neutral-900 mt-1">
              {settings.currencySymbol}{cashCollected.toFixed(2)}
            </div>
          </div>

          <div className="p-3 bg-[#F6F8F6] rounded-xl border border-neutral-200">
            <div className="flex items-center gap-1 text-[11px] font-bold text-amber-700 uppercase">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Payouts Given</span>
            </div>
            <div className="text-xl font-black text-neutral-900 mt-1">
              {settings.currencySymbol}{farmerDisbursed.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Dues Summary */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-2xs space-y-2">
        <h3 className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
          Current Ledger Balances
        </h3>
        <div className="flex justify-between items-center py-1 border-b border-neutral-100 text-xs">
          <span className="text-neutral-600">Total Customer Receivables (Dues to Collect):</span>
          <span className="font-extrabold text-amber-800 font-mono">
            {settings.currencySymbol}{totalReceivable.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between items-center py-1 text-xs">
          <span className="text-neutral-600">Total Farmer Payables (Owed to Suppliers):</span>
          <span className="font-extrabold text-neutral-900 font-mono">
            {settings.currencySymbol}{totalPayable.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};
