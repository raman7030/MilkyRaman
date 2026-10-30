import React, { useState } from 'react';
import { Product } from '../types';
import { useDairyStore } from '../data/storage';
import {
  Package,
  Plus,
  SlidersHorizontal,
  X,
  AlertTriangle,
  Check
} from 'lucide-react';

export const ProductsStockView: React.FC = () => {
  const store = useDairyStore();
  const settings = store.getSettings();
  const products = store.getProducts();

  const [showAddModal, setShowAddModal] = useState(false);
  const [adjustProduct, setAdjustProduct] = useState<Product | null>(null);
  const [adjustAmount, setAdjustAmount] = useState('5.0');
  const [adjustType, setAdjustType] = useState<'ADD' | 'SUBTRACT'>('ADD');
  const [adjustReason, setAdjustReason] = useState('In-house curd/paneer production');

  // New product
  const [name, setName] = useState('');
  const [unit, setUnit] = useState<'LITRE' | 'KG' | 'PACKET'>('LITRE');
  const [saleRate, setSaleRate] = useState('60.00');
  const [initialStock, setInitialStock] = useState('10.0');
  const [error, setError] = useState<string | null>(null);

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError('Product name is required');
      return;
    }
    store.addProduct({
      name: name.trim(),
      unit,
      saleRate: (parseFloat(saleRate) || 0).toFixed(2),
      stockQuantity: (parseFloat(initialStock) || 0).toFixed(3),
      active: true
    });
    setName('');
    setShowAddModal(false);
  };

  const handleSaveAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustProduct) return;

    const currentQty = parseFloat(adjustProduct.stockQuantity) || 0;
    const change = parseFloat(adjustAmount) || 0;
    const newQty = adjustType === 'ADD' ? currentQty + change : Math.max(0, currentQty - change);

    store.saveProduct({
      ...adjustProduct,
      stockQuantity: newQty.toFixed(3)
    });
    setAdjustProduct(null);
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-neutral-900 tracking-tight">Products & Stock</h2>
          <p className="text-xs text-neutral-500">Dairy inventory, value-added products and rates</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#167A45] hover:bg-[#13683a] text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Product List */}
      <div className="space-y-2.5">
        {products.map(product => {
          const stock = parseFloat(product.stockQuantity) || 0;
          const isLow = stock < 5;

          return (
            <div
              key={product.id}
              className="bg-white rounded-2xl p-4 border border-neutral-200/90 shadow-2xs space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-neutral-900">{product.name}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">
                      per {product.unit}
                    </span>
                  </div>
                  <div className="text-xs text-neutral-500 font-semibold mt-0.5">
                    Selling Rate: {settings.currencySymbol}{parseFloat(product.saleRate).toFixed(2)} / {product.unit}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-semibold text-neutral-500 uppercase">
                    Stock on Hand
                  </span>
                  <div
                    className={`text-base font-black font-mono ${
                      isLow ? 'text-amber-700' : 'text-neutral-900'
                    }`}
                  >
                    {stock.toFixed(2)} {product.unit === 'LITRE' ? 'L' : product.unit}
                  </div>
                  {isLow && (
                    <span className="text-[10px] text-amber-600 font-semibold flex items-center justify-end gap-0.5">
                      <AlertTriangle className="w-3 h-3" /> Low Stock
                    </span>
                  )}
                </div>
              </div>

              {/* Adjust Stock Button */}
              <div className="pt-1 flex justify-end">
                <button
                  onClick={() => setAdjustProduct(product)}
                  className="py-1.5 px-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#167A45]" />
                  Adjust Stock / Production
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Adjust Stock Modal */}
      {adjustProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-neutral-200">
            <div className="flex items-center justify-between pb-3 border-b">
              <div>
                <h3 className="font-bold text-sm text-neutral-900">Adjust {adjustProduct.name} Stock</h3>
                <p className="text-xs text-neutral-500">
                  Current: {parseFloat(adjustProduct.stockQuantity).toFixed(2)} {adjustProduct.unit}
                </p>
              </div>
              <button onClick={() => setAdjustProduct(null)} className="cursor-pointer text-neutral-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdjustment} className="space-y-3 pt-3">
              <div className="grid grid-cols-2 gap-2 bg-neutral-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setAdjustType('ADD')}
                  className={`py-1.5 text-xs font-bold rounded-lg cursor-pointer ${
                    adjustType === 'ADD' ? 'bg-[#167A45] text-white' : 'text-neutral-600'
                  }`}
                >
                  + Add Stock
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustType('SUBTRACT')}
                  className={`py-1.5 text-xs font-bold rounded-lg cursor-pointer ${
                    adjustType === 'SUBTRACT' ? 'bg-amber-700 text-white' : 'text-neutral-600'
                  }`}
                >
                  - Deduct Stock
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Quantity ({adjustProduct.unit})
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={adjustAmount}
                  onChange={e => setAdjustAmount(e.target.value)}
                  className="w-full text-sm font-bold px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#167A45]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Reason / Note</label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={e => setAdjustReason(e.target.value)}
                  className="w-full text-xs px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#167A45]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAdjustProduct(null)}
                  className="flex-1 py-2 text-xs font-bold border rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-bold bg-[#167A45] text-white rounded-xl hover:bg-[#13683a]"
                >
                  Save Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-neutral-200">
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className="font-bold text-sm text-neutral-900">Add New Product</h3>
              <button onClick={() => setShowAddModal(false)} className="cursor-pointer text-neutral-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-3 pt-3">
              {error && <div className="text-xs text-red-600 bg-red-50 p-2 rounded-lg">{error}</div>}

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Product Name</label>
                <input
                  type="text"
                  placeholder="e.g. Masala Chaas (Buttermilk)"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#167A45]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Unit</label>
                  <select
                    value={unit}
                    onChange={e => setUnit(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#167A45]"
                  >
                    <option value="LITRE">Litre</option>
                    <option value="KG">Kilogram (KG)</option>
                    <option value="PACKET">Packet</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Selling Rate ({settings.currencySymbol})
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={saleRate}
                    onChange={e => setSaleRate(e.target.value)}
                    className="w-full text-xs px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#167A45]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Initial Stock</label>
                <input
                  type="number"
                  step="0.5"
                  value={initialStock}
                  onChange={e => setInitialStock(e.target.value)}
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
                  Create Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
