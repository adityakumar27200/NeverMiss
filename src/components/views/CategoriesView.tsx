import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Tags,
  Plus,
  Trash2,
  FolderCheck,
} from 'lucide-react';

export const CategoriesView: React.FC = () => {
  const { categories, addCategory, deleteCategory, tasks } = useApp();

  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#6366F1');

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    addCategory({
      name: newCatName.trim(),
      color: newCatColor,
      icon: 'Tag',
      isDefault: false,
    });
    setNewCatName('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <Tags className="w-6 h-6 text-indigo-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Categories & Workspaces</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Organize personal life, corporate projects, financial accounts, and health domains.
          </p>
        </div>
      </div>

      {/* Add Category Bar */}
      <form onSubmit={handleCreateCategory} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-3">
        <input
          type="text"
          required
          value={newCatName}
          onChange={e => setNewCatName(e.target.value)}
          placeholder="New Category name (e.g. Side Hustle, Legal, Fitness)..."
          className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
        />

        <div className="flex items-center space-x-2">
          <input
            type="color"
            value={newCatColor}
            onChange={e => setNewCatColor(e.target.value)}
            className="w-9 h-8 bg-transparent border-0 rounded cursor-pointer"
            title="Pick category accent color"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            Create Category
          </button>
        </div>
      </form>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map(cat => {
          const taskCount = tasks.filter(t => t.categoryId === cat.id).length;

          return (
            <div
              key={cat.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-3 hover:border-slate-700 transition"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div
                    className="w-3.5 h-3.5 rounded-full shadow-sm"
                    style={{ backgroundColor: cat.color }}
                  />
                  <h3 className="font-bold text-sm text-white">{cat.name}</h3>
                </div>

                {!cat.isDefault && (
                  <button
                    onClick={() => deleteCategory(cat.id)}
                    className="p-1 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800 transition"
                    title="Delete category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/80">
                <span>Active Tasks:</span>
                <span className="font-semibold text-slate-200">{taskCount}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
