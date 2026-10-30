import React from 'react';
import { Home, ShoppingCart, Users, BookOpen, MoreHorizontal } from 'lucide-react';

export type TabType = 'Home' | 'Sales' | 'Parties' | 'Khata' | 'More';

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs: { label: TabType; icon: React.ReactNode }[] = [
    { label: 'Home', icon: <Home className="w-5 h-5" /> },
    { label: 'Sales', icon: <ShoppingCart className="w-5 h-5" /> },
    { label: 'Parties', icon: <Users className="w-5 h-5" /> },
    { label: 'Khata', icon: <BookOpen className="w-5 h-5" /> },
    { label: 'More', icon: <MoreHorizontal className="w-5 h-5" /> }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200 py-1.5 px-3">
      <div className="max-w-md mx-auto grid grid-cols-5 gap-1">
        {tabs.map(tab => {
          const isActive = activeTab === tab.label;
          return (
            <button
              key={tab.label}
              onClick={() => onTabChange(tab.label)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'text-[#167A45] font-bold'
                  : 'text-neutral-500 hover:text-neutral-800 font-medium'
              }`}
            >
              <div
                className={`p-1 rounded-full transition-colors ${
                  isActive ? 'bg-[#E5F3E9] text-[#167A45]' : ''
                }`}
              >
                {tab.icon}
              </div>
              <span className="text-[11px] leading-tight tracking-tight mt-0.5">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
