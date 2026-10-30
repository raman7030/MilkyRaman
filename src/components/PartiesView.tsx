import React, { useState } from 'react';
import { FarmersView } from './FarmersView';
import { CustomersView } from './CustomersView';
import { MilkEntry, Payment } from '../types';
import { Users, UserCheck } from 'lucide-react';

interface PartiesViewProps {
  initialSubTab?: 'farmers' | 'customers';
  onOpenMilkBuyForFarmer: (farmerId: string) => void;
  onOpenMilkSellForCustomer: (customerId: string) => void;
  onOpenPaymentForParty: (partyId: string, type: 'CUSTOMER_RECEIPT' | 'FARMER_PAYOUT') => void;
  onViewSlip: (entry?: MilkEntry, payment?: Payment) => void;
}

export const PartiesView: React.FC<PartiesViewProps> = ({
  initialSubTab = 'farmers',
  onOpenMilkBuyForFarmer,
  onOpenMilkSellForCustomer,
  onOpenPaymentForParty,
  onViewSlip
}) => {
  const [subTab, setSubTab] = useState<'farmers' | 'customers'>(initialSubTab);

  return (
    <div className="space-y-4">
      {/* Sub Tabs Pill Navigation */}
      <div className="flex bg-neutral-200/80 p-1 rounded-2xl max-w-sm mx-auto">
        <button
          onClick={() => setSubTab('farmers')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            subTab === 'farmers'
              ? 'bg-white text-[#167A45] shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <Users className="w-4 h-4" />
          Farmers (Suppliers)
        </button>
        <button
          onClick={() => setSubTab('customers')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            subTab === 'customers'
              ? 'bg-white text-[#167A45] shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          Retail Customers
        </button>
      </div>

      {subTab === 'farmers' ? (
        <FarmersView
          onOpenMilkBuyForFarmer={onOpenMilkBuyForFarmer}
          onOpenPaymentForFarmer={id => onOpenPaymentForParty(id, 'FARMER_PAYOUT')}
          onViewSlip={onViewSlip}
        />
      ) : (
        <CustomersView
          onOpenMilkSellForCustomer={onOpenMilkSellForCustomer}
          onOpenPaymentForCustomer={id => onOpenPaymentForParty(id, 'CUSTOMER_RECEIPT')}
          onViewSlip={onViewSlip}
        />
      )}
    </div>
  );
};
