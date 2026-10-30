import { Farmer, Customer, MilkEntry, Payment, Product, Expense, Subscription, DairySettings, RateSlab } from '../types';

export const DEFAULT_RATE_CHART: RateSlab[] = [
  { minFat: 3.0, ratePerLitre: 34.00 },
  { minFat: 3.2, ratePerLitre: 36.50 },
  { minFat: 3.5, ratePerLitre: 40.00 },
  { minFat: 3.8, ratePerLitre: 42.50 },
  { minFat: 4.0, ratePerLitre: 44.00 },
  { minFat: 4.5, ratePerLitre: 48.00 },
  { minFat: 5.0, ratePerLitre: 53.00 },
  { minFat: 5.5, ratePerLitre: 57.50 },
  { minFat: 6.0, ratePerLitre: 62.00 },
  { minFat: 6.5, ratePerLitre: 66.50 },
  { minFat: 7.0, ratePerLitre: 71.00 },
  { minFat: 7.5, ratePerLitre: 76.00 }
];

export const DEFAULT_SETTINGS: DairySettings = {
  dairyName: 'MilkyRaman Dairy Farm',
  tagline: 'Pure Milk, Transparent Hisab',
  ownerName: 'Raman Choudhary',
  phone: '+91 98765 43210',
  address: 'Village Milk Center, Sector 12, Rural Hub',
  currencySymbol: '₹',
  cowDefaultRate: '40.00',
  buffaloDefaultRate: '56.00',
  rateChart: DEFAULT_RATE_CHART
};

export const INITIAL_FARMERS: Farmer[] = [
  { id: 'f-1', name: 'Ramesh Patel', phone: '+91 98250 11223', milkType: 'COW', active: true, createdAt: Date.now() - 86400000 * 20 },
  { id: 'f-2', name: 'Balwant Singh', phone: '+91 94140 88291', milkType: 'BUFFALO', active: true, createdAt: Date.now() - 86400000 * 18 },
  { id: 'f-3', name: 'Devendra Yadav', phone: '+91 97830 55140', milkType: 'BUFFALO', active: true, createdAt: Date.now() - 86400000 * 15 },
  { id: 'f-4', name: 'Ramswaroop Sharma', phone: '+91 99281 44021', milkType: 'COW', active: true, createdAt: Date.now() - 86400000 * 10 },
  { id: 'f-5', name: 'Jagdish Gurjar', phone: '+91 96024 33190', milkType: 'MIXED', active: true, createdAt: Date.now() - 86400000 * 5 }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  { id: 'c-1', name: 'Sharma Niwas', phone: '+91 98290 77101', address: 'A-14 Shanti Nagar', defaultRate: '62.00', active: true, createdAt: Date.now() - 86400000 * 20 },
  { id: 'c-2', name: 'Gupta Sweet Shop', phone: '+91 94141 33200', address: 'Station Road, Shop #4', defaultRate: '68.00', active: true, createdAt: Date.now() - 86400000 * 19 },
  { id: 'c-3', name: 'Verma Family', phone: '+91 98251 66200', address: 'Flat 402, Galaxy Heights', defaultRate: '62.00', active: true, createdAt: Date.now() - 86400000 * 14 },
  { id: 'c-4', name: 'Ananya Dairy Booth', phone: '+91 97120 44100', address: 'Main Market, Stall 8', defaultRate: '58.00', active: true, createdAt: Date.now() - 86400000 * 12 },
  { id: 'c-5', name: 'Joshi Ji', phone: '+91 99280 11980', address: 'House 22, Green Avenue', defaultRate: '64.00', active: true, createdAt: Date.now() - 86400000 * 8 }
];

export const INITIAL_PRODUCTS: Product[] = [
  { id: 'p-1', name: 'Fresh Buffalo Milk', unit: 'LITRE', saleRate: '72.00', stockQuantity: '84.000', active: true },
  { id: 'p-2', name: 'Fresh Cow Milk', unit: 'LITRE', saleRate: '62.00', stockQuantity: '112.500', active: true },
  { id: 'p-3', name: 'Malai Paneer', unit: 'KG', saleRate: '380.00', stockQuantity: '14.500', active: true },
  { id: 'p-4', name: 'Pure Desi Ghee', unit: 'KG', saleRate: '650.00', stockQuantity: '22.000', active: true },
  { id: 'p-5', name: 'Sweet / Plain Dahi (Curd)', unit: 'KG', saleRate: '70.00', stockQuantity: '35.000', active: true }
];

const getToday = () => new Date().toISOString().split('T')[0];
const getYesterday = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
};

export const INITIAL_MILK_ENTRIES: MilkEntry[] = [
  // Today's collections
  {
    id: 'me-1',
    partyId: 'f-1',
    entryType: 'FARMER_BUY',
    entryDate: getToday(),
    shift: 'AM',
    milkType: 'COW',
    quantityLitres: '14.50',
    fat: '3.9',
    snf: '8.5',
    ratePerLitre: '42.50',
    totalAmount: '616.25',
    note: 'Clean morning delivery',
    createdAt: Date.now() - 1000 * 60 * 180
  },
  {
    id: 'me-2',
    partyId: 'f-2',
    entryType: 'FARMER_BUY',
    entryDate: getToday(),
    shift: 'AM',
    milkType: 'BUFFALO',
    quantityLitres: '22.00',
    fat: '6.5',
    snf: '9.0',
    ratePerLitre: '66.50',
    totalAmount: '1463.00',
    note: 'Premium fat morning batch',
    createdAt: Date.now() - 1000 * 60 * 150
  },
  {
    id: 'me-3',
    partyId: 'f-3',
    entryType: 'FARMER_BUY',
    entryDate: getToday(),
    shift: 'AM',
    milkType: 'BUFFALO',
    quantityLitres: '18.50',
    fat: '6.2',
    snf: '9.0',
    ratePerLitre: '62.00',
    totalAmount: '1147.00',
    note: '',
    createdAt: Date.now() - 1000 * 60 * 120
  },
  // Today's sales
  {
    id: 'me-4',
    partyId: 'c-1',
    entryType: 'CUSTOMER_SELL',
    entryDate: getToday(),
    shift: 'AM',
    milkType: 'COW',
    quantityLitres: '3.00',
    fat: null,
    snf: null,
    ratePerLitre: '62.00',
    totalAmount: '186.00',
    note: 'Morning doorstep delivery',
    createdAt: Date.now() - 1000 * 60 * 90
  },
  {
    id: 'me-5',
    partyId: 'c-2',
    entryType: 'CUSTOMER_SELL',
    entryDate: getToday(),
    shift: 'AM',
    milkType: 'BUFFALO',
    quantityLitres: '25.00',
    fat: null,
    snf: null,
    ratePerLitre: '68.00',
    totalAmount: '1700.00',
    note: 'Sweet shop daily wholesale can',
    createdAt: Date.now() - 1000 * 60 * 60
  },
  {
    id: 'me-6',
    partyId: 'c-3',
    entryType: 'CUSTOMER_SELL',
    entryDate: getToday(),
    shift: 'AM',
    milkType: 'COW',
    quantityLitres: '2.50',
    fat: null,
    snf: null,
    ratePerLitre: '62.00',
    totalAmount: '155.00',
    note: '',
    createdAt: Date.now() - 1000 * 60 * 30
  },
  // Yesterday's records
  {
    id: 'me-7',
    partyId: 'f-1',
    entryType: 'FARMER_BUY',
    entryDate: getYesterday(),
    shift: 'PM',
    milkType: 'COW',
    quantityLitres: '12.00',
    fat: '3.8',
    snf: '8.5',
    ratePerLitre: '42.50',
    totalAmount: '510.00',
    note: 'Evening supply',
    createdAt: Date.now() - 86400000
  },
  {
    id: 'me-8',
    partyId: 'c-2',
    entryType: 'CUSTOMER_SELL',
    entryDate: getYesterday(),
    shift: 'PM',
    milkType: 'BUFFALO',
    quantityLitres: '20.00',
    fat: null,
    snf: null,
    ratePerLitre: '68.00',
    totalAmount: '1360.00',
    note: '',
    createdAt: Date.now() - 86400000 + 3600000
  }
];

export const INITIAL_PAYMENTS: Payment[] = [
  {
    id: 'pay-1',
    partyId: 'f-1',
    paymentType: 'FARMER_PAYOUT',
    paymentDate: getYesterday(),
    amount: '1000.00',
    method: 'UPI',
    reference: 'UPI/409283719',
    note: 'Weekly advance payment',
    createdAt: Date.now() - 86400000
  },
  {
    id: 'pay-2',
    partyId: 'c-2',
    paymentType: 'CUSTOMER_RECEIPT',
    paymentDate: getToday(),
    amount: '3000.00',
    method: 'CASH',
    reference: 'CASH-REC-01',
    note: 'Part payment against previous dues',
    createdAt: Date.now() - 1000 * 60 * 45
  }
];

export const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    title: 'Cattle Feed / Khal Churi',
    category: 'Cattle Feed',
    expenseDate: getToday(),
    amount: '850.00',
    paymentMethod: 'CASH',
    note: '2 bags of high-protein feed',
  },
  {
    id: 'exp-2',
    title: 'Delivery Scooter Petrol',
    category: 'Transportation',
    expenseDate: getYesterday(),
    amount: '320.00',
    paymentMethod: 'UPI',
    note: 'Full tank for morning milk round',
  }
];

export const INITIAL_SUBSCRIPTIONS: Subscription[] = [
  { id: 'sub-1', customerId: 'c-1', shift: 'AM', quantityLitres: '3.00', milkType: 'COW', active: true, startDate: '2026-10-01', notes: 'Leave at front porch door' },
  { id: 'sub-2', customerId: 'c-2', shift: 'BOTH', quantityLitres: '25.00', milkType: 'BUFFALO', active: true, startDate: '2026-09-15', notes: 'Deliver in 25L aluminum can' },
  { id: 'sub-3', customerId: 'c-3', shift: 'AM', quantityLitres: '2.50', milkType: 'COW', active: true, startDate: '2026-10-10' },
  { id: 'sub-4', customerId: 'c-5', shift: 'AM', quantityLitres: '1.50', milkType: 'BUFFALO', active: true, startDate: '2026-10-15', notes: 'Ring bell on delivery' }
];
