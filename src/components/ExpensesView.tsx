import React, { useState } from 'react';
import { Expense } from '../types';
import { useDairyStore } from '../data/storage';
import {
  Fuel,
  Plus,
  Trash2,
  Calendar,
  X,
  CreditCard,
  Tag
} from 'lucide-react';

const EXPENSE_CATEGORIES = [
  'Cattle Feed',
  'Transportation',
  'Electricity',
  'Packaging',
  'Veterinary & Medicine',
  'Labor & Wages',
  'Maintenance',
  'Other'
];

export const ExpensesView: React.FC = () => {
  const store = useDairyStore();
  const settings = store.getSettings();
  const expenses = store.getExpenses();

  const [showAddModal, setShowAddModal] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [expenseDate, setExpenseDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState('500');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'UPI' | 'BANK'>('CASH');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const filtered = expenses.filter(
    exp => categoryFilter === 'ALL' || exp.category === categoryFilter
  );

  const totalExpense = filtered.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      setError('Amount must be greater than zero');
      return;
    }

    store.addExpense({
      title: title.trim(),
      category,
      expenseDate,
      amount: amt.toFixed(2),
      paymentMethod,
      note: note.trim()
    });

    setTitle('');
    setNote('');
    setShowAddModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this expense entry?')) {
      store.deleteExpense(id);
    }
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-neutral-900 tracking-tight">Operating Expenses</h2>
          <p className="text-xs text-neutral-500">Cattle feed, fuel, power, labor & dairy upkeep</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#167A45] hover:bg-[#13683a] text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Expense
        </button>
      </div>

      {/* Summary Banner */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-2xs flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-neutral-500 uppercase">
            Total Logged Expenses ({categoryFilter === 'ALL' ? 'All' : categoryFilter})
          </span>
          <div className="text-2xl font-black text-amber-900 mt-0.5">
            {settings.currencySymbol}{totalExpense.toFixed(2)}
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
          <Fuel className="w-5 h-5" />
        </div>
      </div>

      {/* Categories Filter Strip */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setCategoryFilter('ALL')}
          className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition-colors cursor-pointer ${
            categoryFilter === 'ALL'
              ? 'bg-[#167A45] text-white'
              : 'bg-white border border-neutral-200 text-neutral-600'
          }`}
        >
          All Categories
        </button>
        {EXPENSE_CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition-colors cursor-pointer ${
              categoryFilter === cat
                ? 'bg-[#167A45] text-white'
                : 'bg-white border border-neutral-200 text-neutral-600'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Expenses List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-neutral-200 text-neutral-500 text-xs">
            No expenses logged in this category.
          </div>
        ) : (
          filtered.map(exp => (
            <div
              key={exp.id}
              className="bg-white rounded-2xl p-3.5 border border-neutral-200/90 shadow-2xs flex items-center justify-between"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-neutral-900">{exp.title}</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                    {exp.category}
                  </span>
                </div>
                <div className="text-xs text-neutral-500">
                  {exp.expenseDate} · Paid via {exp.paymentMethod}
                  {exp.note ? ` · ${exp.note}` : ''}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-sm font-black font-mono text-neutral-900">
                  {settings.currencySymbol}{parseFloat(exp.amount).toFixed(2)}
                </div>
                <button
                  onClick={() => handleDelete(exp.id)}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-neutral-200">
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className="font-bold text-sm text-neutral-900">Record Operating Expense</h3>
              <button onClick={() => setShowAddModal(false)} className="cursor-pointer text-neutral-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-3 pt-3">
              {error && <div className="text-xs text-red-600 bg-red-50 p-2 rounded-lg">{error}</div>}

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Expense Title</label>
                <input
                  type="text"
                  placeholder="e.g. Scooter Fuel for Morning Run"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#167A45]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full text-xs px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#167A45]"
                  >
                    {EXPENSE_CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Amount ({settings.currencySymbol})</label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="w-full text-xs font-bold px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#167A45]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Method</label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#167A45]"
                  >
                    <option value="CASH">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="BANK">Bank</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={expenseDate}
                    onChange={e => setExpenseDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#167A45]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Remarks (Optional)</label>
                <input
                  type="text"
                  placeholder="Receipt bill number or vendor"
                  value={note}
                  onChange={e => setNote(e.target.value)}
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
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
