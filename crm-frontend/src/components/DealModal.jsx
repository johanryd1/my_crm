import React from 'react';

const DealModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  dealData, 
  setDealData, 
  phases, 
  isEditing 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-white/20">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditing ? 'Redigera affär' : 'Skapa ny affärsmöjlighet'}
          </h2>
          <p className="text-sm text-gray-500">
            {isEditing ? 'Uppdatera detaljerna för denna affär' : 'Lägg till en ny affär på kontot'}
          </p>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Affärens namn</label>
            <input 
              type="text"
              className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="t.ex. Uppgradering av licenser"
              value={dealData.name}
              onChange={e => setDealData({...dealData, name: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Värde (SEK)</label>
              <input 
                type="number"
                className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="0"
                value={dealData.value}
                onChange={e => setDealData({...dealData, value: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Fas</label>
              <select 
                className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white appearance-none cursor-pointer transition-all"
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

        <div className="p-6 bg-gray-50 flex gap-3">
          <button 
            onClick={onSave}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-200 active:transform active:scale-95"
          >
            {isEditing ? 'Uppdatera affär' : 'Spara affär'}
          </button>
          <button 
            onClick={onClose}
            className="flex-1 bg-white border border-gray-200 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-100 transition-all"
          >
            Avbryt
          </button>
        </div>
      </div>
    </div>
  );
};

export default DealModal;