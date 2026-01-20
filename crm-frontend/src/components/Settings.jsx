import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { IconTrash } from './Icons';

const PRESET_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
  '#8b5cf6', '#ec4899', '#64748b', '#06b6d4'
];

export default function Settings() {
  const [phases, setPhases] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', color: '#3b82f6', is_default: false });

  useEffect(() => { fetchPhases(); }, []);

  const fetchPhases = async () => {
    const res = await axios.get('http://127.0.0.1:8000/api/phases/');
    setPhases(res.data.sort((a, b) => a.order - b.order));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await axios.put(`http://127.0.0.1:8000/api/phases/${editingId}/`, formData);
    } else {
      await axios.post('http://127.0.0.1:8000/api/phases/', { ...formData, order: phases.length });
    }
    resetForm();
    fetchPhases();
  };

  const startEdit = (phase) => {
    setEditingId(phase.id);
    setFormData({ name: phase.name, color: phase.color, is_default: phase.is_default });
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ name: '', color: '#3b82f6', is_default: false });
  };

  const deletePhase = async (id) => {
    if (window.confirm("Ta bort fas?")) {
      await axios.delete(`http://127.0.0.1:8000/api/phases/${id}/`);
      fetchPhases();
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12"> {/* Centrerar allt till samma bredd */}
      
      {/* --- RUBRIK --- */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Inställningar</h1>
        <p className="text-gray-500">Hantera konfigurationen för ditt CRM</p>
      </div>

      {/* --- FORMULÄR-RUTA --- */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-4 text-gray-700">
          {editingId ? 'Redigera fas' : 'Skapa ny fas'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Fasnamn</label>
            <input 
              className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-gray-50 focus:bg-white"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="t.ex. Kvalificerad lead"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2 ml-1">Välj färgtema</label>
            <div className="flex flex-wrap gap-3 mb-3">
              {PRESET_COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({...formData, color})}
                  className={`w-10 h-10 rounded-full border-4 transition-all ${formData.color === color ? 'border-gray-300 scale-110 shadow-sm' : 'border-transparent hover:scale-105'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
              <div className="relative">
                 <input 
                  type="color" 
                  value={formData.color} 
                  onChange={e => setFormData({...formData, color: e.target.value})}
                  className="w-10 h-10 p-0 border-none bg-transparent cursor-pointer rounded-full overflow-hidden"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 py-2">
            <input 
              type="checkbox" 
              id="is_default"
              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              checked={formData.is_default}
              onChange={e => setFormData({...formData, is_default: e.target.checked})}
            />
            <label htmlFor="is_default" className="text-sm font-medium text-gray-600 cursor-pointer">Sätt som standard för nya konton</label>
          </div>

          <div className="flex gap-2 pt-2">
            <button type="submit" className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all">
              {editingId ? 'Uppdatera fas' : 'Spara ny fas'}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="bg-gray-100 text-gray-600 px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all">
                Avbryt
              </button>
            )}
          </div>
        </form>
      </div>

      {/* --- LISTA MED FAS-KORT (Samma bredd som formuläret) --- */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase ml-1 tracking-widest">Befintliga faser</h3>
        {phases.map(phase => (
          <div 
            key={phase.id} 
            className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all relative overflow-hidden group flex items-center justify-between"
          >
            {/* Färgindikator på kanten */}
            <div className="absolute top-0 left-0 w-1.5 h-full" style={{ backgroundColor: phase.color }} />

            <div className="flex items-center gap-4 ml-2">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black shadow-inner"
                style={{ backgroundColor: phase.color }}
              >
                {phase.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-gray-800">{phase.name}</h3>
                <div className="flex items-center gap-2">
                  {phase.is_default && (
                    <span className="text-[9px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">Standard</span>
                  )}
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">Steg {phase.order + 1}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 pr-2">
              <button 
                onClick={() => startEdit(phase)}
                className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"
              >
                Redigera
              </button>
              <button 
                onClick={() => deletePhase(phase.id)}
                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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