import React from 'react';
import {
  TrendingUp,
  Droplets,
  ShoppingCart,
  Users,
  CreditCard,
  Calendar,
  Truck,
  Package,
  Receipt,
  Plus,
  ChevronRight,
  UserCheck,
  CircleDollarSign,
  Fuel
} from 'lucide-react';
import { useDairyStore } from '../data/storage';

interface DashboardProps {
  onOpenMilkBuy: () => void;
  onOpenMilkSell: () => void;
  onOpenPayment: () => void;
  onNavigateToModule: (moduleName: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onOpenMilkBuy,
  onOpenMilkSell,
  onOpenPayment,
  onNavigateToModule
}) => {
  const store = useDairyStore();
  const settings = store.getSettings();
  const today = new Date().toISOString().split('T')[0];

  const entries = store.getMilkEntries();
  const payments = store.getPayments();
  const farmers = store.getFarmers().filter(f => f.active);
  const customers = store.getCustomers().filter(c => c.active);

  // Today's metrics
  const todaySalesEntries = entries.filter(e => e.entryType === 'CUSTOMER_SELL' && e.entryDate === today);
  const todayBuyEntries = entries.filter(e => e.entryType === 'FARMER_BUY' && e.entryDate === today);

  const todaySalesAmount = todaySalesEntries.reduce((sum, e) => sum + (parseFloat(e.totalAmount) || 0), 0);
  const todaySalesLitres = todaySalesEntries.reduce((sum, e) => sum + (parseFloat(e.quantityLitres) || 0), 0);

  const todayBuyAmount = todayBuyEntries.reduce((sum, e) => sum + (parseFloat(e.totalAmount) || 0), 0);
  const todayBuyLitres = todayBuyEntries.reduce((sum, e) => sum + (parseFloat(e.quantityLitres) || 0), 0);

  // Payments collected today
  const todayCollected = payments
    .filter(p => p.paymentType === 'CUSTOMER_RECEIPT' && p.paymentDate === today)
    .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

  // Overall customer dues
  const totalCustomerDues = customers.reduce((sum, c) => {
    const bal = store.getCustomerBalance(c.id);
    return sum + (bal.balanceDue > 0 ? bal.balanceDue : 0);
  }, 0);

  const modules = [
    {
      id: 'Milk Buy',
      title: 'Milk Buy',
      subtitle: 'Farmer collection · FAT/SNF · AM/PM',
      icon: <Droplets className="w-5 h-5 text-[#167A45]" />,
      action: onOpenMilkBuy
    },
    {
      id: 'Milk Sell',
      title: 'Milk Sell',
      subtitle: 'Customer sales · fixed or quality rate',
      icon: <ShoppingCart className="w-5 h-5 text-[#167A45]" />,
      action: onOpenMilkSell
    },
    {
      id: 'Farmers',
      title: 'Farmers',
      subtitle: 'Farmer profiles and purchase history',
      icon: <Users className="w-5 h-5 text-[#167A45]" />,
      action: () => onNavigateToModule('Farmers')
    },
    {
      id: 'Customers',
      title: 'Customers',
      subtitle: 'Customer profiles and individual rates',
      icon: <UserCheck className="w-5 h-5 text-[#167A45]" />,
      action: () => onNavigateToModule('Customers')
    },
    {
      id: 'Payments & Khata',
      title: 'Payments & Khata',
      subtitle: 'Receipts, payouts, advances and dues',
      icon: <CreditCard className="w-5 h-5 text-[#167A45]" />,
      action: () => onNavigateToModule('Khata')
    },
    {
      id: 'Subscriptions',
      title: 'Subscriptions',
      subtitle: 'Recurring quantity and delivery schedule',
      icon: <Calendar className="w-5 h-5 text-[#167A45]" />,
      action: () => onNavigateToModule('Subscriptions')
    },
    {
      id: 'Delivery',
      title: 'Delivery',
      subtitle: 'Route lists and delivery status',
      icon: <Truck className="w-5 h-5 text-[#167A45]" />,
      action: () => onNavigateToModule('Delivery')
    },
    {
      id: 'Products & Stock',
      title: 'Products & Stock',
      subtitle: 'Milk, curd, paneer, ghee and stock',
      icon: <Package className="w-5 h-5 text-[#167A45]" />,
      action: () => onNavigateToModule('Products')
    },
    {
      id: 'Bills & Reports',
      title: 'Bills & Reports',
      subtitle: 'Day book, statements and profitability',
      icon: <Receipt className="w-5 h-5 text-[#167A45]" />,
      action: () => onNavigateToModule('Reports')
    },
    {
      id: 'Expenses',
      title: 'Operating Expenses',
      subtitle: 'Cattle feed, fuel, maintenance & labor',
      icon: <Fuel className="w-5 h-5 text-[#167A45]" />,
      action: () => onNavigateToModule('Expenses')
    }
  ];

  return (
    <div className="space-y-5 pb-6">
      {/* Hero Green Card matching Android MilkyRaman Theme */}
      <div className="bg-[#167A45] text-white rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute right-12 -bottom-10 w-28 h-28 rounded-full bg-white/5 pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold tracking-wider uppercase text-white/80">
                TODAY'S RETAIL SALES
              </span>
              <div className="text-3xl sm:text-4xl font-black tracking-tight mt-0.5">
                {settings.currencySymbol}{todaySalesAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div className="p-3 bg-white/15 rounded-2xl backdrop-blur-xs">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>

          <div className="h-px bg-white/20 w-full" />

          {/* 3 Metrics Row */}
          <div className="grid grid-cols-3 gap-2 text-center sm:text-left">
            <div>
              <div className="text-[10px] font-bold tracking-wider text-white/70 uppercase">
                MILK SOLD
              </div>
              <div className="text-base sm:text-lg font-bold mt-0.5 font-mono">
                {todaySalesLitres.toFixed(2)} L
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold tracking-wider text-white/70 uppercase">
                FARMERS
              </div>
              <div className="text-base sm:text-lg font-bold mt-0.5">
                {farmers.length}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold tracking-wider text-white/70 uppercase">
                CUSTOMERS
              </div>
              <div className="text-base sm:text-lg font-bold mt-0.5">
                {customers.length}
              </div>
            </div>
          </div>

          {/* Secondary mini metrics strip */}
          <div className="pt-1 flex flex-wrap gap-2 text-[11px] font-semibold text-white/90">
            <span className="bg-white/15 px-2.5 py-1 rounded-full">
              Intake: {todayBuyLitres.toFixed(1)} L ({settings.currencySymbol}{todayBuyAmount.toFixed(0)})
            </span>
            <span className="bg-white/15 px-2.5 py-1 rounded-full">
              Cash Collected: {settings.currencySymbol}{todayCollected.toFixed(0)}
            </span>
            {totalCustomerDues > 0 && (
              <span className="bg-amber-400/25 text-amber-100 px-2.5 py-1 rounded-full">
                Pending Dues: {settings.currencySymbol}{totalCustomerDues.toFixed(0)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Quick actions section */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-1">
          <h2 className="text-base font-bold text-neutral-900">Quick actions</h2>
          <span className="text-[10px] font-extrabold tracking-wider text-[#167A45] uppercase">
            DAILY WORK
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          <button
            onClick={onOpenMilkBuy}
            className="flex items-center justify-center gap-1.5 py-3.5 px-2 bg-[#E5F3E9] hover:bg-[#d8edd0] text-[#167A45] font-bold text-xs sm:text-sm rounded-2xl shadow-xs transition-all active:scale-98 cursor-pointer border border-[#167A45]/20"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span className="truncate">Milk Buy</span>
          </button>
          <button
            onClick={onOpenMilkSell}
            className="flex items-center justify-center gap-1.5 py-3.5 px-2 bg-[#E5F3E9] hover:bg-[#d8edd0] text-[#167A45] font-bold text-xs sm:text-sm rounded-2xl shadow-xs transition-all active:scale-98 cursor-pointer border border-[#167A45]/20"
          >
            <ShoppingCart className="w-4 h-4 shrink-0" />
            <span className="truncate">Milk Sell</span>
          </button>
          <button
            onClick={onOpenPayment}
            className="flex items-center justify-center gap-1.5 py-3.5 px-2 bg-[#E5F3E9] hover:bg-[#d8edd0] text-[#167A45] font-bold text-xs sm:text-sm rounded-2xl shadow-xs transition-all active:scale-98 cursor-pointer border border-[#167A45]/20"
          >
            <CreditCard className="w-4 h-4 shrink-0" />
            <span className="truncate">Payment</span>
          </button>
        </div>
      </div>

      {/* Manage your dairy list */}
      <div className="space-y-2">
        <h2 className="text-base font-bold text-neutral-900 px-1 pt-1">Manage your dairy</h2>

        <div className="space-y-2">
          {modules.map(mod => (
            <div
              key={mod.id}
              onClick={mod.action}
              className="bg-white hover:bg-neutral-50/80 border border-neutral-200/80 rounded-2xl p-3.5 flex items-center justify-between shadow-2xs transition-all cursor-pointer active:scale-[0.995]"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#E5F3E9] flex items-center justify-center shrink-0">
                  {mod.icon}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 leading-snug">{mod.title}</h3>
                  <p className="text-xs text-neutral-500 leading-tight">{mod.subtitle}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-neutral-400" />
            </div>
          ))}
        </div>
      </div>

      {/* Footer footer tagline */}
      <div className="text-center pt-2">
        <p className="text-[11px] font-medium text-neutral-400">
          MilkyRaman 0.2.0 · Offline-First Dairy Management System
        </p>
      </div>
    </div>
  );
};
