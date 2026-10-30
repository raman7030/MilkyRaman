import React, { useState } from 'react';
import { Header } from './components/Header';
import { Navigation, TabType } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { SalesView } from './components/SalesView';
import { PartiesView } from './components/PartiesView';
import { KhataLedgerView } from './components/KhataLedgerView';
import { SubscriptionsView } from './components/SubscriptionsView';
import { DeliveryView } from './components/DeliveryView';
import { ProductsStockView } from './components/ProductsStockView';
import { ExpensesView } from './components/ExpensesView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';

import { MilkBuyModal } from './components/MilkBuyModal';
import { MilkSellModal } from './components/MilkSellModal';
import { PaymentModal } from './components/PaymentModal';
import { SlipModal } from './components/SlipModal';

import { MilkEntry, Payment, PaymentType } from './types';
import {
  Package,
  Calendar,
  Truck,
  Receipt,
  Fuel,
  Settings,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Droplets,
  ShoppingCart,
  Users,
  CreditCard
} from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>('Home');
  const [activeSubView, setActiveSubView] = useState<string | null>(null);

  // Modals state
  const [showMilkBuy, setShowMilkBuy] = useState(false);
  const [showMilkSell, setShowMilkSell] = useState(false);
  const [paymentModalData, setPaymentModalData] = useState<{
    open: boolean;
    type: PaymentType;
    partyId?: string;
  }>({
    open: false,
    type: 'CUSTOMER_RECEIPT'
  });

  // Slip modal state
  const [slipModalData, setSlipModalData] = useState<{
    open: boolean;
    entry?: MilkEntry | null;
    payment?: Payment | null;
  }>({
    open: false
  });

  // Navigation handlers
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setActiveSubView(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToModule = (moduleName: string) => {
    if (moduleName === 'Milk Buy') {
      setShowMilkBuy(true);
    } else if (moduleName === 'Milk Sell') {
      setShowMilkSell(true);
    } else if (moduleName === 'Farmers') {
      setActiveTab('Parties');
      setActiveSubView('farmers');
    } else if (moduleName === 'Customers') {
      setActiveTab('Parties');
      setActiveSubView('customers');
    } else if (moduleName === 'Khata' || moduleName === 'Payments & Khata') {
      setActiveTab('Khata');
      setActiveSubView(null);
    } else {
      setActiveSubView(moduleName);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Open slip
  const handleOpenSlip = (entry?: MilkEntry | null, payment?: Payment | null) => {
    setSlipModalData({ open: true, entry, payment });
  };

  return (
    <div className="min-h-screen bg-[#F6F8F6] text-neutral-900 pb-20">
      <Header />

      <main className="max-w-2xl mx-auto px-3.5 sm:px-6 pt-4">
        {/* Back navigation when in a sub-view */}
        {activeSubView && (
          <button
            onClick={() => setActiveSubView(null)}
            className="mb-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#167A45] hover:underline bg-white px-3 py-1.5 rounded-xl border border-neutral-200/80 shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Overview
          </button>
        )}

        {/* Dynamic Screen Routing */}
        {activeSubView === 'Subscriptions' ? (
          <SubscriptionsView />
        ) : activeSubView === 'Delivery' ? (
          <DeliveryView />
        ) : activeSubView === 'Products' ? (
          <ProductsStockView />
        ) : activeSubView === 'Reports' ? (
          <ReportsView />
        ) : activeSubView === 'Expenses' ? (
          <ExpensesView />
        ) : activeSubView === 'Settings' ? (
          <SettingsView />
        ) : activeTab === 'Home' ? (
          <Dashboard
            onOpenMilkBuy={() => setShowMilkBuy(true)}
            onOpenMilkSell={() => setShowMilkSell(true)}
            onOpenPayment={() =>
              setPaymentModalData({ open: true, type: 'CUSTOMER_RECEIPT' })
            }
            onNavigateToModule={handleNavigateToModule}
          />
        ) : activeTab === 'Sales' ? (
          <SalesView
            onOpenMilkSell={() => setShowMilkSell(true)}
            onViewSlip={entry => handleOpenSlip(entry, undefined)}
          />
        ) : activeTab === 'Parties' ? (
          <PartiesView
            initialSubTab={activeSubView === 'customers' ? 'customers' : 'farmers'}
            onOpenMilkBuyForFarmer={_ => setShowMilkBuy(true)}
            onOpenMilkSellForCustomer={_ => setShowMilkSell(true)}
            onOpenPaymentForParty={(partyId, type) =>
              setPaymentModalData({ open: true, type, partyId })
            }
            onViewSlip={handleOpenSlip}
          />
        ) : activeTab === 'Khata' ? (
          <KhataLedgerView
            onOpenPaymentModal={(type, partyId) =>
              setPaymentModalData({ open: true, type, partyId })
            }
            onViewSlip={payment => handleOpenSlip(undefined, payment)}
          />
        ) : activeTab === 'More' ? (
          <div className="space-y-4 pb-12">
            <div>
              <h2 className="text-xl font-black text-neutral-900 tracking-tight">More Dairy Operations</h2>
              <p className="text-xs text-neutral-500">Inventory, delivery routes, day book and rate chart</p>
            </div>

            <div className="space-y-2">
              {[
                {
                  id: 'Subscriptions',
                  title: 'Subscriptions & Schedules',
                  subtitle: 'Daily customer milk quota & pauses',
                  icon: <Calendar className="w-5 h-5 text-[#167A45]" />
                },
                {
                  id: 'Delivery',
                  title: 'Delivery Route Sheet',
                  subtitle: 'Morning & evening delivery checklists',
                  icon: <Truck className="w-5 h-5 text-[#167A45]" />
                },
                {
                  id: 'Products',
                  title: 'Products & Stock Inventory',
                  subtitle: 'Milk, curd, paneer, ghee and batches',
                  icon: <Package className="w-5 h-5 text-[#167A45]" />
                },
                {
                  id: 'Reports',
                  title: 'Day Book & Business Reports',
                  subtitle: 'Sales, procurement, profit & CSV export',
                  icon: <Receipt className="w-5 h-5 text-[#167A45]" />
                },
                {
                  id: 'Expenses',
                  title: 'Operating Expenses',
                  subtitle: 'Cattle feed, fuel, power & labor',
                  icon: <Fuel className="w-5 h-5 text-[#167A45]" />
                },
                {
                  id: 'Settings',
                  title: 'Rate Chart & Dairy Settings',
                  subtitle: 'FAT rate slabs, profile and backup',
                  icon: <Settings className="w-5 h-5 text-[#167A45]" />
                }
              ].map(item => (
                <div
                  key={item.id}
                  onClick={() => setActiveSubView(item.id)}
                  className="bg-white hover:bg-neutral-50/80 rounded-2xl p-3.5 border border-neutral-200/90 shadow-2xs flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#E5F3E9] flex items-center justify-center">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-neutral-900">{item.title}</h4>
                      <p className="text-xs text-neutral-500">{item.subtitle}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-neutral-400" />
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </main>

      {/* Persistent Bottom Navigation */}
      <Navigation activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Global Modals */}
      {showMilkBuy && (
        <MilkBuyModal
          onClose={() => setShowMilkBuy(false)}
          onSuccess={saved => {
            setShowMilkBuy(false);
            handleOpenSlip(saved, undefined);
          }}
        />
      )}

      {showMilkSell && (
        <MilkSellModal
          onClose={() => setShowMilkSell(false)}
          onSuccess={saved => {
            setShowMilkSell(false);
            handleOpenSlip(saved, undefined);
          }}
        />
      )}

      {paymentModalData.open && (
        <PaymentModal
          initialType={paymentModalData.type}
          initialPartyId={paymentModalData.partyId}
          onClose={() => setPaymentModalData(prev => ({ ...prev, open: false }))}
          onSuccess={saved => {
            setPaymentModalData(prev => ({ ...prev, open: false }));
            handleOpenSlip(undefined, saved);
          }}
        />
      )}

      {slipModalData.open && (
        <SlipModal
          entry={slipModalData.entry}
          payment={slipModalData.payment}
          onClose={() => setSlipModalData({ open: false })}
        />
      )}
    </div>
  );
}

export default App;
