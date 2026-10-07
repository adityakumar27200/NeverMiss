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
  Edit2,
  X,
  Check,
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
    updateGroceryItem,
    clearPurchasedGrocery,
    addGroceryItem,
  } = useApp();

  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [quickItemName, setQuickItemName] = useState('');

  // In-card editing state
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editQty, setEditQty] = useState(1);
  const [editUnit, setEditUnit] = useState('pcs');
  const [editCategory, setEditCategory] = useState<GroceryCategory>('Other');
  const [editStore, setEditStore] = useState('');
  const [editPrice, setEditPrice] = useState<string>('');
  const [editNotes, setEditNotes] = useState('');
  const [editAssignedUserId, setEditAssignedUserId] = useState('');

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

  const handleStartEdit = (item: GroceryItem) => {
    setEditingItemId(item.id);
    setEditName(item.name);
    setEditQty(item.quantity);
    setEditUnit(item.unit);
    setEditCategory(item.category);
    setEditStore(item.store || '');
    setEditPrice(item.price !== undefined ? item.price.toString() : '');
    setEditNotes(item.notes || '');
    setEditAssignedUserId(item.assignedUserId || '');
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
  };

  const handleSaveEdit = (itemId: string) => {
    if (!editName.trim()) return;
    updateGroceryItem(itemId, {
      name: editName.trim(),
      quantity: Number(editQty) || 1,
      unit: editUnit.trim() || 'item',
      category: editCategory,
      store: editStore.trim() || undefined,
      price: editPrice ? Number(editPrice) : undefined,
      notes: editNotes.trim() || undefined,
      assignedUserId: editAssignedUserId || undefined,
    });
    setEditingItemId(null);
  };

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
            pendingItems.map(item => {
              const isEditing = editingItemId === item.id;

              if (isEditing) {
                return (
                  <div
                    key={item.id}
                    className="p-3.5 bg-slate-800 rounded-xl border border-emerald-500/50 space-y-3 text-xs shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-emerald-400 flex items-center space-x-1">
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit Item</span>
                      </span>
                      <button
                        onClick={handleCancelEdit}
                        className="text-slate-400 hover:text-white p-1"
                        title="Cancel edit"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="sm:col-span-2">
                        <label className="text-[10px] text-slate-400 block mb-0.5 font-medium">Item Name</label>
                        <input
                          type="text"
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div className="flex gap-1.5">
                        <div className="w-1/2">
                          <label className="text-[10px] text-slate-400 block mb-0.5 font-medium">Qty</label>
                          <input
                            type="number"
                            min="1"
                            value={editQty}
                            onChange={e => setEditQty(Number(e.target.value) || 1)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none"
                          />
                        </div>
                        <div className="w-1/2">
                          <label className="text-[10px] text-slate-400 block mb-0.5 font-medium">Unit</label>
                          <input
                            type="text"
                            value={editUnit}
                            onChange={e => setEditUnit(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5 font-medium">Category</label>
                        <select
                          value={editCategory}
                          onChange={e => setEditCategory(e.target.value as GroceryCategory)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none"
                        >
                          {categoriesList.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5 font-medium">Store</label>
                        <input
                          type="text"
                          value={editStore}
                          onChange={e => setEditStore(e.target.value)}
                          placeholder="e.g. Costco"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5 font-medium">Price ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={editPrice}
                          onChange={e => setEditPrice(e.target.value)}
                          placeholder="0.00"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5 font-medium">Assigned Family Member</label>
                        <select
                          value={editAssignedUserId}
                          onChange={e => setEditAssignedUserId(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none"
                        >
                          <option value="">Unassigned</option>
                          {users.map(u => (
                            <option key={u.id} value={u.id}>
                              {u.fullName} {u.relationship ? `(${u.relationship})` : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5 font-medium">Notes</label>
                        <input
                          type="text"
                          value={editNotes}
                          onChange={e => setEditNotes(e.target.value)}
                          placeholder="Brand, organic, ripeness..."
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end space-x-2 pt-1 border-t border-slate-700/60">
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="px-3 py-1 text-xs text-slate-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(item.id)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1 cursor-pointer transition shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Save in Card</span>
                      </button>
                    </div>
                  </div>
                );
              }

              return (
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

                  <div className="flex items-center space-x-2 shrink-0">
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
                      onClick={() => handleStartEdit(item)}
                      className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-700/60 transition"
                      title="Edit in card"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteGroceryItem(item.id)}
                      className="text-slate-500 hover:text-red-400 p-1 rounded hover:bg-slate-700/60 transition"
                      title="Delete item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
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
