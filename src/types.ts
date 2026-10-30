export type MilkType = 'COW' | 'BUFFALO' | 'MIXED';
export type ShiftType = 'AM' | 'PM';
export type MilkEntryType = 'FARMER_BUY' | 'CUSTOMER_SELL';
export type PaymentType = 'FARMER_PAYOUT' | 'CUSTOMER_RECEIPT';
export type PaymentMethod = 'CASH' | 'UPI' | 'BANK' | 'CHEQUE' | 'OTHER';

export interface Farmer {
  id: string;
  name: string;
  phone: string;
  milkType: MilkType;
  active: boolean;
  createdAt: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  defaultRate: string; // e.g. "60.00"
  active: boolean;
  createdAt: number;
}

export interface MilkEntry {
  id: string;
  partyId: string;
  entryType: MilkEntryType;
  entryDate: string; // YYYY-MM-DD
  shift: ShiftType;
  milkType: MilkType;
  quantityLitres: string;
  fat: string | null;
  snf: string | null;
  ratePerLitre: string;
  totalAmount: string;
  note: string;
  createdAt: number;
}

export interface Payment {
  id: string;
  partyId: string;
  paymentType: PaymentType;
  paymentDate: string;
  amount: string;
  method: PaymentMethod;
  reference: string;
  note: string;
  createdAt: number;
}

export interface Product {
  id: string;
  name: string;
  unit: 'LITRE' | 'KG' | 'PACKET';
  saleRate: string;
  stockQuantity: string;
  active: boolean;
}

export interface Expense {
  id: string;
  title: string;
  category: string;
  expenseDate: string;
  amount: string;
  paymentMethod: 'CASH' | 'UPI' | 'BANK';
  note: string;
}

export interface Subscription {
  id: string;
  customerId: string;
  shift: 'AM' | 'PM' | 'BOTH';
  quantityLitres: string;
  milkType: MilkType;
  active: boolean;
  startDate: string;
  notes?: string;
}

export interface DeliveryRecord {
  id: string;
  date: string; // YYYY-MM-DD
  customerId: string;
  shift: ShiftType;
  quantityLitres: string;
  status: 'PENDING' | 'DELIVERED' | 'SKIPPED' | 'EXTRA';
  actualQuantity?: string;
}

export interface RateSlab {
  minFat: number;
  ratePerLitre: number;
}

export interface DairySettings {
  dairyName: string;
  tagline: string;
  ownerName: string;
  phone: string;
  address: string;
  currencySymbol: string;
  cowDefaultRate: string;
  buffaloDefaultRate: string;
  rateChart: RateSlab[];
}
