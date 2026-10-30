import React, { useState } from 'react';
import { Customer, MilkEntry, Payment } from '../types';
import { useDairyStore } from '../data/storage';
import {
  Search,
  Plus,
  Phone,
  MapPin,
  ShoppingCart,
  History,
  X,
  ArrowDownLeft,
  Trash2
} from 'lucide-react';

interface CustomersViewProps {
  onOpenMilkSellForCustomer: (customerId: string) => void;
  onOpenPaymentForCustomer: (customerId: string) => void;
  onViewSlip: (entry?: MilkEntry, payment?: Payment) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  onOpenMilkSellForCustomer,
  onOpenPaymentForCustomer,
  onViewSlip
}) => {
  const store = useDairyStore();
  const settings = store.getSettings();
  const customers = store.getCustomers();

  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCustHistory, setSelectedCustHistory] = useState<Customer | null>(null);

  // New Customer Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [defaultRate, setDefaultRate] = useState('62.00');
  const [error, setError] = useState<string | null>(null);

  const filteredCustomers = customers.filter(c => c.active !== false).filter(c => {
    return (
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.address.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError('Customer name is required');
      return;
    }
    store.addCustomer({
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      defaultRate: defaultRate || '60.00',
      active: true
    });
    setName('');
    setPhone('');
    setAddress('');
    setShowAddModal(false);
  };

  // Customer history records
  const custEntries = selectedCustHistory
    ? store.getMilkEntries().filter(e => e.partyId === selectedCustHistory.id)
    : [];
  const custPayments = selectedCustHistory
    ? store.getPayments().filter(p => p.partyId === selectedCustHistory.id)
    : [];

  return (
    <div className="space-y-4 pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-neutral-900 tracking-tight">Retail Customers</h2>
          <p className="text-xs text-neutral-500">Profiles, negotiated rates and receivable dues</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#167A45] hover:bg-[#13683a] text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Customer
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
        <input
          type="text"
          placeholder="Search customer by name, address or mobile..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full text-xs pl-9 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#167A45]"
        />
      </div>

      {/* Customers List */}
      <div className="space-y-2.5">
        {filteredCustomers.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-neutral-200 text-neutral-500 text-xs">
            No customers found matching your criteria.
          </div>
        ) : (
          filteredCustomers.map(cust => {
            const bal = store.getCustomerBalance(cust.id);
            return (
              <div
                key={cust.id}
                className="bg-white rounded-2xl p-4 border border-neutral-200/90 shadow-2xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-neutral-900">{cust.name}</h3>
                    {cust.address && (
                      <p className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 shrink-0 text-neutral-400" />
                        <span className="truncate">{cust.address}</span>
                      </p>
                    )}
                    {cust.phone && (
                      <a
                        href={`tel:${cust.phone}`}
                        className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5 hover:text-[#167A45]"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{cust.phone}</span>
                      </a>
                    )}
                  </div>

                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => {
                        const confirmed = window.confirm(`Delete ${cust.name} from active customers? Their sales and payment history will be retained.`);
                        if (confirmed) store.deleteCustomer(cust.id);
                      }}
                      className="mb-2 inline-flex items-center gap-1 rounded-lg border border-red-200 px-2 py-1 text-[10px] font-bold text-red-700 hover:bg-red-50"
                      aria-label={`Delete customer ${cust.name}`}
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                    <span className="text-[10px] font-semibold text-neutral-500 uppercase">
                      Receivable Due
                    </span>
                    <div
                      className={`text-sm font-extrabold ${
                        bal.balanceDue > 0 ? 'text-amber-700' : 'text-neutral-700'
                      }`}
                    >
                      {settings.currencySymbol}
                      {bal.balanceDue.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-neutral-400 mt-0.5">
                      Rate: {settings.currencySymbol}{cust.defaultRate}/L
                    </div>
                  </div>
                </div>

                {/* Metrics ribbon */}
                <div className="grid grid-cols-3 gap-2 bg-[#F6F8F6] p-2.5 rounded-xl text-center text-xs">
                  <div>
                    <div className="text-[10px] text-neutral-500 font-medium">Purchased</div>
                    <div className="font-bold font-mono text-neutral-800">{bal.totalLitres.toFixed(1)} L</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-neutral-500 font-medium">Total Billed</div>
                    <div className="font-bold font-mono text-neutral-800">
                      {settings.currencySymbol}{bal.totalReceivable.toFixed(0)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-neutral-500 font-medium">Received</div>
                    <div className="font-bold font-mono text-emerald-700">
                      {settings.currencySymbol}{bal.totalReceived.toFixed(0)}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-0.5">
                  <button
                    onClick={() => onOpenMilkSellForCustomer(cust.id)}
                    className="flex-1 py-1.5 px-2 bg-[#E5F3E9] hover:bg-[#d8edd0] text-[#167A45] font-bold text-xs rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-colors"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    Milk Sell
                  </button>
                  <button
                    onClick={() => onOpenPaymentForCustomer(cust.id)}
                    className="flex-1 py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-colors border border-emerald-200"
                  >
                    <ArrowDownLeft className="w-3.5 h-3.5" />
                    Collect Due
                  </button>
                  <button
                    onClick={() => setSelectedCustHistory(cust)}
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

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-neutral-200">
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className="font-bold text-sm text-neutral-900">Add New Customer</h3>
              <button onClick={() => setShowAddModal(false)} className="cursor-pointer text-neutral-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomer} className="space-y-3 pt-3">
              {error && <div className="text-xs text-red-600 bg-red-50 p-2 rounded-lg">{error}</div>}

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Customer / Family Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sharma Niwas"
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
                  placeholder="e.g. +91 98290 77101"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full text-xs px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#167A45]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Delivery Address</label>
                <input
                  type="text"
                  placeholder="e.g. A-14 Shanti Nagar"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full text-xs px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#167A45]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Default Selling Rate ({settings.currencySymbol}/L)</label>
                <input
                  type="number"
                  step="0.5"
                  value={defaultRate}
                  onChange={e => setDefaultRate(e.target.value)}
                  className="w-full text-xs px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#167A45]"
                  required
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
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Khata History Modal */}
      {selectedCustHistory && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-neutral-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b">
              <div>
                <h3 className="font-bold text-base text-neutral-900">{selectedCustHistory.name} - Khata</h3>
                <p className="text-xs text-neutral-500">Retail Sales & Collection Receipts</p>
              </div>
              <button
                onClick={() => setSelectedCustHistory(null)}
                className="p-1 rounded-full hover:bg-neutral-100 cursor-pointer"
              >
                <X className="w-5 h-5 text-neutral-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-4">
              {/* Milk Sales */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                  Sales Entries ({custEntries.length})
                </h4>
                {custEntries.length === 0 ? (
                  <p className="text-xs text-neutral-400 italic">No sales recorded yet.</p>
                ) : (
                  <div className="space-y-1.5">
                    {custEntries.map(e => (
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
                            Rate: {settings.currencySymbol}{e.ratePerLitre}/L
                            {e.note ? ` · ${e.note}` : ''}
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

              {/* Payments Received */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                  Payments Received ({custPayments.length})
                </h4>
                {custPayments.length === 0 ? (
                  <p className="text-xs text-neutral-400 italic">No payments recorded yet.</p>
                ) : (
                  <div className="space-y-1.5">
                    {custPayments.map(p => (
                      <div
                        key={p.id}
                        onClick={() => onViewSlip(undefined, p)}
                        className="p-2.5 bg-neutral-50 rounded-xl flex items-center justify-between text-xs hover:bg-emerald-50 transition-colors cursor-pointer border border-neutral-100"
                      >
                        <div>
                          <div className="font-bold text-neutral-800">
                            {p.paymentDate} · {p.method}
                          </div>
                          {p.reference && <div className="text-[11px] text-neutral-500">Ref: {p.reference}</div>}
                        </div>
                        <div className="font-bold text-emerald-700 font-mono">
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
                onClick={() => setSelectedCustHistory(null)}
                className="w-full py-2.5 bg-neutral-800 text-white font-bold text-xs rounded-xl"
              >
                Close Khata
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
