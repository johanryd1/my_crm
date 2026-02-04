import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { IconTrash } from '../Icons';
import API_BASE_URL from '../../api';

const PRODUCT_TYPES = [
  { value: 'service', label: 'Tjänst' },
  { value: 'hardware', label: 'Hårdvara' },
  { value: 'software', label: 'Mjukvara' },
  { value: 'subscription', label: 'Prenumeration' },
];

const TYPE_COLORS = {
  service: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
  hardware: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
  software: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
  subscription: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
};

const emptyForm = {
  name: '',
  description: '',
  sku: '',
  product_type: 'service',
  unit_price: '',
  cost_price: '',
  is_active: true,
};

export default function ProductSettings() {
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    const res = await axios.get(`${API_BASE_URL}/api/products/`);
    setProducts(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      unit_price: formData.unit_price === '' ? null : parseFloat(formData.unit_price),
      cost_price: formData.cost_price === '' ? null : parseFloat(formData.cost_price),
    };
    if (editingId) {
      await axios.put(`${API_BASE_URL}/api/products/${editingId}/`, payload);
    } else {
      await axios.post(`${API_BASE_URL}/api/products/`, payload);
    }
    resetForm();
    fetchProducts();
  };

  const startEdit = (product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      description: product.description || '',
      sku: product.sku || '',
      product_type: product.product_type,
      unit_price: product.unit_price ?? '',
      cost_price: product.cost_price ?? '',
      is_active: product.is_active,
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData(emptyForm);
  };

  const deleteProduct = async (id) => {
    if (window.confirm("Ta bort produkt?")) {
      await axios.delete(`${API_BASE_URL}/api/products/${id}/`);
      fetchProducts();
    }
  };

  const formatPrice = (price) => {
    if (price === null || price === undefined) return '-';
    return new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* --- FORM --- */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-4 text-gray-700 dark:text-gray-200">
          {editingId ? 'Redigera produkt' : 'Skapa ny produkt'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1 ml-1">Produktnamn *</label>
            <input
              className="w-full border border-gray-200 dark:border-gray-600 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-gray-50 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-600 text-gray-900 dark:text-gray-100"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="t.ex. Konsulttimme"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1 ml-1">Beskrivning</label>
            <textarea
              className="w-full border border-gray-200 dark:border-gray-600 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-gray-50 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-600 text-gray-900 dark:text-gray-100 resize-none"
              rows={3}
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="Valfri beskrivning av produkten"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1 ml-1">Artikelnummer (SKU)</label>
              <input
                className="w-full border border-gray-200 dark:border-gray-600 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-gray-50 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-600 text-gray-900 dark:text-gray-100"
                value={formData.sku}
                onChange={e => setFormData({...formData, sku: e.target.value})}
                placeholder="t.ex. KONS-001"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1 ml-1">Produkttyp</label>
              <select
                className="w-full border border-gray-200 dark:border-gray-600 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-gray-50 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-600 text-gray-900 dark:text-gray-100"
                value={formData.product_type}
                onChange={e => setFormData({...formData, product_type: e.target.value})}
              >
                {PRODUCT_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1 ml-1">Listpris (SEK)</label>
              <input
                type="number"
                step="0.01"
                className="w-full border border-gray-200 dark:border-gray-600 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-gray-50 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-600 text-gray-900 dark:text-gray-100"
                value={formData.unit_price}
                onChange={e => setFormData({...formData, unit_price: e.target.value})}
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1 ml-1">Inköpspris (SEK)</label>
              <input
                type="number"
                step="0.01"
                className="w-full border border-gray-200 dark:border-gray-600 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-gray-50 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-600 text-gray-900 dark:text-gray-100"
                value={formData.cost_price}
                onChange={e => setFormData({...formData, cost_price: e.target.value})}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 py-2">
            <input
              type="checkbox"
              id="is_active"
              className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:bg-gray-700"
              checked={formData.is_active}
              onChange={e => setFormData({...formData, is_active: e.target.checked})}
            />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-600 dark:text-gray-300 cursor-pointer">Aktiv produkt</label>
          </div>

          <div className="flex gap-2 pt-2">
            <button type="submit" className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 dark:shadow-blue-900/30 transition-all">
              {editingId ? 'Uppdatera produkt' : 'Spara ny produkt'}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-6 py-3 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all">
                Avbryt
              </button>
            )}
          </div>
        </form>
      </div>

      {/* --- PRODUCT LIST --- */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase ml-1 tracking-widest">Befintliga produkter</h3>
        {products.length === 0 && (
          <p className="text-gray-400 dark:text-gray-500 text-sm ml-1">Inga produkter skapade än.</p>
        )}
        {products.map(product => (
          <div
            key={product.id}
            className={`bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all relative overflow-hidden group flex items-center justify-between ${!product.is_active ? 'opacity-60' : ''}`}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 font-black">
                {product.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-800 dark:text-gray-100">{product.name}</h3>
                  {!product.is_active && (
                    <span className="text-[9px] bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">Inaktiv</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter ${TYPE_COLORS[product.product_type]}`}>
                    {PRODUCT_TYPES.find(t => t.value === product.product_type)?.label}
                  </span>
                  {product.sku && (
                    <span className="text-[9px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-tighter">SKU: {product.sku}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 pr-2">
              <div className="text-right">
                <div className="text-sm font-bold text-gray-800 dark:text-gray-100">{formatPrice(product.unit_price)}</div>
                {product.cost_price && (
                  <div className="text-[10px] text-gray-400 dark:text-gray-500">Inköp: {formatPrice(product.cost_price)}</div>
                )}
              </div>
              <button
                onClick={() => startEdit(product)}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 px-3 py-2 rounded-lg transition-colors"
              >
                Redigera
              </button>
              <button
                onClick={() => deleteProduct(product.id)}
                className="p-2 text-gray-300 dark:text-gray-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
              >
                <IconTrash className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
