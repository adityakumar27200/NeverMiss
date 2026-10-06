import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShoppingCart,
  Plus,
  CheckSquare,
  Square,
  Trash2,
  DollarSign,
  Store,
  Tag,
  CheckCircle2,
} from 'lucide-react';
import { GroceryCategory, GroceryItem } from '../../types';

interface GroceryViewProps {
  onOpenQuickCreate: (tab?: any) => void;
}

export const GroceryView: React.FC<GroceryViewProps> = ({ onOpenQuickCreate }) => {
  const {
    groceryItems,
    users,
    currentUser,
    toggleGroceryItem,
    deleteGroceryItem,
    clearPurchasedGrocery,
    addGroceryItem,
  } = useApp();

  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [quickItemName, setQuickItemName] = useState('');

  const categoriesList: GroceryCategory[] = [
    'Vegetables',
    'Fruits',
    'Dairy',
    'Grains',
    'Snacks',
    'Beverages',
    'Household',
    'Personal Care',
    'Other',
  ];

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickItemName.trim()) return;

    addGroceryItem({
      name: quickItemName.trim(),
      quantity: 1,
      unit: 'item',
      category: 'Other',
      completed: false,
    });
    setQuickItemName('');
  };

  const filteredItems = groceryItems.filter(item => {
    if (activeCategoryFilter !== 'all' && item.category !== activeCategoryFilter) return false;
    return true;
  });

  const pendingItems = filteredItems.filter(i => !i.completed);
  const purchasedItems = filteredItems.filter(i => i.completed);

  const totalPrice = groceryItems
    .filter(i => !i.completed && i.price !== undefined)
    .reduce((sum, i) => sum + (i.price || 0) * (i.quantity || 1), 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <ShoppingCart className="w-6 h-6 text-emerald-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Grocery & Shopping Lists</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Fast, lightweight shopping checklist with categorizations, stores, and price totals.
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          {groceryItems.some(i => i.completed) && (
            <button
              onClick={clearPurchasedGrocery}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700 transition cursor-pointer"
            >
              Clear Checked
            </button>
          )}
          <button
            onClick={() => onOpenQuickCreate('grocery')}
            className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-600/25 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Quick single-line Add Bar */}
      <form onSubmit={handleQuickAdd} className="bg-slate-900 border border-slate-800 p-3 rounded-2xl flex items-center gap-2">
        <input
          type="text"
          value={quickItemName}
          onChange={e => setQuickItemName(e.target.value)}
          placeholder="⚡ Fast add: Type grocery item and press Enter (e.g. Eggs, Avocados, Olive Oil)..."
          className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
        >
          Add
        </button>
      </form>

      {/* Category Pills & Total Cost */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 max-w-full scrollbar-none">
          <button
            onClick={() => setActiveCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer shrink-0 ${
              activeCategoryFilter === 'all'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            All Items ({groceryItems.length})
          </button>
          {categoriesList.map(cat => {
            const count = groceryItems.filter(i => i.category === cat).length;
            if (count === 0) return null;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer shrink-0 ${
                  activeCategoryFilter === cat
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        {totalPrice > 0 && (
          <div className="text-xs bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 text-emerald-400 font-semibold">
            Est. Total: ${totalPrice.toFixed(2)}
          </div>
        )}
      </div>

      {/* Checklist Sections */}
      <div className="space-y-4">
        {/* Pending Items */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            To Buy ({pendingItems.length})
          </h3>

          {pendingItems.length === 0 ? (
            <p className="text-center py-6 text-xs text-slate-400">
              🛒 All shopping items purchased!
            </p>
          ) : (
            pendingItems.map(item => (
              <div
                key={item.id}
                className="p-3 bg-slate-800/60 hover:bg-slate-800 rounded-xl border border-slate-700/60 flex items-center justify-between gap-3 text-xs transition"
              >
                <div
                  onClick={() => toggleGroceryItem(item.id)}
                  className="flex items-center space-x-3 min-w-0 cursor-pointer flex-1 select-none"
                >
                  <Square className="w-4 h-4 text-slate-500 hover:text-emerald-400 shrink-0" />
                  <div className="truncate">
                    <span className="font-semibold text-white">
                      {item.name}
                    </span>
                    <span className="text-slate-400 ml-2 font-mono text-[11px]">
                      ({item.quantity} {item.unit})
                    </span>
                    {item.notes && (
                      <span className="text-slate-400 ml-2 italic text-[11px]">
                        • {item.notes}
                      </span>
                    )}

                    {/* Assigned Family Member Badge */}
                    {item.assignedUserId && (() => {
                      const assigneeUser = users.find(u => u.id === item.assignedUserId);
                      if (!assigneeUser) return null;
                      const isSelf = assigneeUser.id === currentUser?.id;
                      return (
                        <span className="ml-2 inline-flex items-center space-x-1 px-2 py-0.2 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 text-[10px] font-medium">
                          <span>👤 {isSelf ? 'Assigned to You' : assigneeUser.fullName}</span>
                          {assigneeUser.relationship && <span className="text-slate-400">({assigneeUser.relationship})</span>}
                        </span>
                      );
                    })()}
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  {item.store && (
                    <span className="text-[10px] bg-slate-700/60 text-slate-300 px-2 py-0.5 rounded border border-slate-600/60 flex items-center space-x-1">
                      <Store className="w-2.5 h-2.5" />
                      <span>{item.store}</span>
                    </span>
                  )}
                  {item.price !== undefined && (
                    <span className="font-mono text-emerald-400 font-semibold text-xs">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  )}
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                    {item.category}
                  </span>
                  <button
                    onClick={() => deleteGroceryItem(item.id)}
                    className="text-slate-500 hover:text-red-400 p-1"
                    title="Delete item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Purchased Items */}
        {purchasedItems.length > 0 && (
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-2 opacity-70">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Purchased ({purchasedItems.length})
            </h3>

            {purchasedItems.map(item => (
              <div
                key={item.id}
                className="p-3 bg-slate-800/30 rounded-xl border border-slate-800 flex items-center justify-between gap-3 text-xs"
              >
                <div
                  onClick={() => toggleGroceryItem(item.id)}
                  className="flex items-center space-x-3 min-w-0 cursor-pointer flex-1 select-none"
                >
                  <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="line-through text-slate-500 truncate">
                    {item.name} ({item.quantity} {item.unit})
                  </span>
                </div>

                <button
                  onClick={() => deleteGroceryItem(item.id)}
                  className="text-slate-600 hover:text-red-400 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
