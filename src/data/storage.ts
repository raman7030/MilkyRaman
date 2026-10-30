import { useState, useEffect } from 'react';
import {
  Farmer,
  Customer,
  MilkEntry,
  Payment,
  Product,
  Expense,
  Subscription,
  DairySettings
} from '../types';
import {
  DEFAULT_SETTINGS,
  INITIAL_FARMERS,
  INITIAL_CUSTOMERS,
  INITIAL_PRODUCTS,
  INITIAL_MILK_ENTRIES,
  INITIAL_PAYMENTS,
  INITIAL_EXPENSES,
  INITIAL_SUBSCRIPTIONS
} from './seedData';

const STORAGE_KEYS = {
  SETTINGS: 'milkyraman_settings_v1',
  FARMERS: 'milkyraman_farmers_v1',
  CUSTOMERS: 'milkyraman_customers_v1',
  PRODUCTS: 'milkyraman_products_v1',
  ENTRIES: 'milkyraman_milk_entries_v1',
  PAYMENTS: 'milkyraman_payments_v1',
  EXPENSES: 'milkyraman_expenses_v1',
  SUBSCRIPTIONS: 'milkyraman_subscriptions_v1'
};

const CHANGE_EVENT = 'milkyraman_data_changed';

function emitChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }
}

function getFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(item) as T;
  } catch (e) {
    console.error(`Error loading ${key}`, e);
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    emitChange();
  } catch (e) {
    console.error(`Error saving ${key}`, e);
  }
}

export const DairyStore = {
  getSettings(): DairySettings {
    return getFromStorage<DairySettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  },
  saveSettings(settings: DairySettings): void {
    saveToStorage(STORAGE_KEYS.SETTINGS, settings);
  },

  getFarmers(): Farmer[] {
    return getFromStorage<Farmer[]>(STORAGE_KEYS.FARMERS, INITIAL_FARMERS);
  },
  addFarmer(farmer: Omit<Farmer, 'id' | 'createdAt'>): Farmer {
    const current = this.getFarmers();
    const newFarmer: Farmer = {
      ...farmer,
      id: 'f-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      createdAt: Date.now()
    };
    saveToStorage(STORAGE_KEYS.FARMERS, [newFarmer, ...current]);
    return newFarmer;
  },
  updateFarmer(farmer: Farmer): void {
    const current = this.getFarmers();
    const updated = current.map(f => (f.id === farmer.id ? farmer : f));
    saveToStorage(STORAGE_KEYS.FARMERS, updated);
  },

  getCustomers(): Customer[] {
    return getFromStorage<Customer[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
  },
  addCustomer(customer: Omit<Customer, 'id' | 'createdAt'>): Customer {
    const current = this.getCustomers();
    const newCustomer: Customer = {
      ...customer,
      id: 'c-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      createdAt: Date.now()
    };
    saveToStorage(STORAGE_KEYS.CUSTOMERS, [newCustomer, ...current]);
    return newCustomer;
  },
  updateCustomer(customer: Customer): void {
    const current = this.getCustomers();
    const updated = current.map(c => (c.id === customer.id ? customer : c));
    saveToStorage(STORAGE_KEYS.CUSTOMERS, updated);
  },

  getMilkEntries(): MilkEntry[] {
    return getFromStorage<MilkEntry[]>(STORAGE_KEYS.ENTRIES, INITIAL_MILK_ENTRIES);
  },
  addMilkEntry(entry: Omit<MilkEntry, 'id' | 'createdAt'>): MilkEntry {
    const current = this.getMilkEntries();
    const newEntry: MilkEntry = {
      ...entry,
      id: 'me-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      createdAt: Date.now()
    };
    // Also adjust stock if applicable
    this.adjustStockForMilk(newEntry.entryType, newEntry.milkType, parseFloat(newEntry.quantityLitres) || 0);
    saveToStorage(STORAGE_KEYS.ENTRIES, [newEntry, ...current]);
    return newEntry;
  },
  deleteMilkEntry(id: string): void {
    const current = this.getMilkEntries();
    saveToStorage(STORAGE_KEYS.ENTRIES, current.filter(e => e.id !== id));
  },

  getPayments(): Payment[] {
    return getFromStorage<Payment[]>(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS);
  },
  addPayment(payment: Omit<Payment, 'id' | 'createdAt'>): Payment {
    const current = this.getPayments();
    const newPayment: Payment = {
      ...payment,
      id: 'pay-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      createdAt: Date.now()
    };
    saveToStorage(STORAGE_KEYS.PAYMENTS, [newPayment, ...current]);
    return newPayment;
  },
  deletePayment(id: string): void {
    const current = this.getPayments();
    saveToStorage(STORAGE_KEYS.PAYMENTS, current.filter(p => p.id !== id));
  },

  getProducts(): Product[] {
    return getFromStorage<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  },
  saveProduct(product: Product): void {
    const current = this.getProducts();
    const index = current.findIndex(p => p.id === product.id);
    if (index >= 0) {
      current[index] = product;
      saveToStorage(STORAGE_KEYS.PRODUCTS, [...current]);
    } else {
      saveToStorage(STORAGE_KEYS.PRODUCTS, [...current, product]);
    }
  },
  addProduct(product: Omit<Product, 'id'>): Product {
    const current = this.getProducts();
    const newProduct: Product = {
      ...product,
      id: 'p-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6)
    };
    saveToStorage(STORAGE_KEYS.PRODUCTS, [...current, newProduct]);
    return newProduct;
  },

  getExpenses(): Expense[] {
    return getFromStorage<Expense[]>(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
  },
  addExpense(expense: Omit<Expense, 'id'>): Expense {
    const current = this.getExpenses();
    const newExpense: Expense = {
      ...expense,
      id: 'exp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6)
    };
    saveToStorage(STORAGE_KEYS.EXPENSES, [newExpense, ...current]);
    return newExpense;
  },
  deleteExpense(id: string): void {
    const current = this.getExpenses();
    saveToStorage(STORAGE_KEYS.EXPENSES, current.filter(e => e.id !== id));
  },

  getSubscriptions(): Subscription[] {
    return getFromStorage<Subscription[]>(STORAGE_KEYS.SUBSCRIPTIONS, INITIAL_SUBSCRIPTIONS);
  },
  saveSubscription(sub: Omit<Subscription, 'id'> & { id?: string }): Subscription {
    const current = this.getSubscriptions();
    if (sub.id) {
      const updated = current.map(s => (s.id === sub.id ? (sub as Subscription) : s));
      saveToStorage(STORAGE_KEYS.SUBSCRIPTIONS, updated);
      return sub as Subscription;
    } else {
      const newSub: Subscription = {
        ...sub,
        id: 'sub-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6)
      };
      saveToStorage(STORAGE_KEYS.SUBSCRIPTIONS, [newSub, ...current]);
      return newSub;
    }
  },
  toggleSubscription(id: string): void {
    const current = this.getSubscriptions();
    const updated = current.map(s => (s.id === id ? { ...s, active: !s.active } : s));
    saveToStorage(STORAGE_KEYS.SUBSCRIPTIONS, updated);
  },

  adjustStockForMilk(entryType: 'FARMER_BUY' | 'CUSTOMER_SELL', milkType: 'COW' | 'BUFFALO' | 'MIXED', litres: number): void {
    const products = this.getProducts();
    const targetName = milkType === 'BUFFALO' ? 'Buffalo' : 'Cow';
    const prodIndex = products.findIndex(p => p.name.toLowerCase().includes(targetName.toLowerCase()));
    if (prodIndex >= 0) {
      const currentStock = parseFloat(products[prodIndex].stockQuantity) || 0;
      const change = entryType === 'FARMER_BUY' ? litres : -litres;
      const newStock = Math.max(0, currentStock + change);
      products[prodIndex].stockQuantity = newStock.toFixed(3);
      saveToStorage(STORAGE_KEYS.PRODUCTS, products);
    }
  },

  // Party balances
  getFarmerBalance(farmerId: string) {
    const entries = this.getMilkEntries().filter(e => e.partyId === farmerId && e.entryType === 'FARMER_BUY');
    const payments = this.getPayments().filter(p => p.partyId === farmerId && p.paymentType === 'FARMER_PAYOUT');

    const totalLitres = entries.reduce((acc, curr) => acc + (parseFloat(curr.quantityLitres) || 0), 0);
    const totalPayable = entries.reduce((acc, curr) => acc + (parseFloat(curr.totalAmount) || 0), 0);
    const totalPaid = payments.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
    const balanceDue = totalPayable - totalPaid; // positive = dairy owes farmer

    return { totalLitres, totalPayable, totalPaid, balanceDue };
  },

  getCustomerBalance(customerId: string) {
    const entries = this.getMilkEntries().filter(e => e.partyId === customerId && e.entryType === 'CUSTOMER_SELL');
    const payments = this.getPayments().filter(p => p.partyId === customerId && p.paymentType === 'CUSTOMER_RECEIPT');

    const totalLitres = entries.reduce((acc, curr) => acc + (parseFloat(curr.quantityLitres) || 0), 0);
    const totalReceivable = entries.reduce((acc, curr) => acc + (parseFloat(curr.totalAmount) || 0), 0);
    const totalReceived = payments.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
    const balanceDue = totalReceivable - totalReceived; // positive = customer owes dairy

    return { totalLitres, totalReceivable, totalReceived, balanceDue };
  },

  resetToDefaults(): void {
    saveToStorage(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    saveToStorage(STORAGE_KEYS.FARMERS, INITIAL_FARMERS);
    saveToStorage(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    saveToStorage(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    saveToStorage(STORAGE_KEYS.ENTRIES, INITIAL_MILK_ENTRIES);
    saveToStorage(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS);
    saveToStorage(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
    saveToStorage(STORAGE_KEYS.SUBSCRIPTIONS, INITIAL_SUBSCRIPTIONS);
  },

  exportBackup(): string {
    const backup = {
      version: '0.2.0',
      exportedAt: new Date().toISOString(),
      settings: this.getSettings(),
      farmers: this.getFarmers(),
      customers: this.getCustomers(),
      products: this.getProducts(),
      entries: this.getMilkEntries(),
      payments: this.getPayments(),
      expenses: this.getExpenses(),
      subscriptions: this.getSubscriptions()
    };
    return JSON.stringify(backup, null, 2);
  },

  importBackup(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.settings) saveToStorage(STORAGE_KEYS.SETTINGS, data.settings);
      if (data.farmers) saveToStorage(STORAGE_KEYS.FARMERS, data.farmers);
      if (data.customers) saveToStorage(STORAGE_KEYS.CUSTOMERS, data.customers);
      if (data.products) saveToStorage(STORAGE_KEYS.PRODUCTS, data.products);
      if (data.entries) saveToStorage(STORAGE_KEYS.ENTRIES, data.entries);
      if (data.payments) saveToStorage(STORAGE_KEYS.PAYMENTS, data.payments);
      if (data.expenses) saveToStorage(STORAGE_KEYS.EXPENSES, data.expenses);
      if (data.subscriptions) saveToStorage(STORAGE_KEYS.SUBSCRIPTIONS, data.subscriptions);
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  }
};

/**
 * Custom React hook that re-renders when data in DairyStore changes
 */
export function useDairyStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const handleUpdate = () => setTick(t => t + 1);
    window.addEventListener(CHANGE_EVENT, handleUpdate);
    return () => window.removeEventListener(CHANGE_EVENT, handleUpdate);
  }, []);

  return DairyStore;
}
