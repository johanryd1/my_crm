import React from 'react';
import { IconTrash } from './Icons'; 

const DealModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  onDelete, 
  dealData, 
  setDealData, 
  phases, 
  isEditing 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditing ? 'Redigera affär' : 'Skapa ny affärsmöjlighet'}
          </h2>
          <p className="text-sm text-gray-500">
            {isEditing ? 'Uppdatera detaljerna för denna affär' : 'Lägg till en ny affär på kontot'}
          </p>
        </div>
        
        <div className="p-6 space-y-4">
          {/* Namn-fält */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Affärens namn</label>
            <input 
              type="text"
              className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-900"
              placeholder="t.ex. Uppgradering av licenser"
              value={dealData.name || ''} 
              onChange={e => setDealData({...dealData, name: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Värde-fält */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Värde (SEK)</label>
              <input 
                type="number"
                className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-900"
                placeholder="0"
                // Om värdet är 0 vid nyskapande, visa tomt så placeholder syns
                value={dealData.value === 0 || dealData.value === '' ? '' : dealData.value}
                onChange={e => setDealData({...dealData, value: e.target.value})}
              />
            </div>

            {/* Fas-väljare */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Fas</label>
              <select 
                className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white appearance-none cursor-pointer transition-all text-gray-900"
                value={dealData.stage}
                onChange={e => setDealData({...dealData, stage: e.target.value})}
              >
                {phases.map(phase => (
                  <option key={phase.id} value={phase.id}>{phase.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 flex items-center justify-between gap-3">
          <div className="min-w-[44px]">
            {isEditing && (
              <button 
                onClick={() => {
                  if(window.confirm("Är du säker på att du vill ta bort den här affären?")) {
                    onDelete();
                  }
                }}
                className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                title="Ta bort affär"
              >
                <IconTrash className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="flex gap-3 flex-1 justify-end">
            <button 
              onClick={onClose}
              className="px-6 bg-white border border-gray-200 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-100 transition-all"
            >
              Avbryt
            </button>
            <button 
              onClick={onSave}
              className="px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-200 active:transform active:scale-95"
            >
              {isEditing ? 'Uppdatera' : 'Spara'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealModal;