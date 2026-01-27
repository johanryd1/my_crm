import React, { useState } from 'react';
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
  // Lokalt state för att hantera inmatning av en ny länk innan den sparas
  const [tempDocName, setTempDocName] = useState('');
  const [tempDocUrl, setTempDocUrl] = useState('');

  if (!isOpen) return null;

  const handleAddDocument = () => {
    if (tempDocName && tempDocUrl) {
      const newDoc = { name: tempDocName, url: tempDocUrl };
      setDealData({
        ...dealData,
        documents: [...(dealData.documents || []), newDoc]
      });
      setTempDocName('');
      setTempDocUrl('');
    }
  };

  const handleRemoveDocument = (index) => {
    const updatedDocs = dealData.documents.filter((_, i) => i !== index);
    setDealData({ ...dealData, documents: updatedDocs });
  };

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
        
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
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
                step="1" // Hindrar decimalsteg
                className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-900"
                placeholder="0"
                // Vi använder Math.round för att ta bort .00-visning
                value={
                  dealData.value === 0 || dealData.value === '' 
                  ? '' 
                  : Math.round(dealData.value)
                }
                onChange={e => {
                  // Vi parsar till Int direkt för att rensa bort ev. decimaler användaren skriver
                  const val = e.target.value === '' ? '' : parseInt(e.target.value);
                  setDealData({...dealData, value: val});
                }}
                // Förhindrar att användaren skriver in tecken som punkt eller komma
                onKeyDown={(e) => {
                  if (e.key === '.' || e.key === ',') {
                    e.preventDefault();
                  }
                }}
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

          {/* DOKUMENT-SEKTION */}
          <div className="pt-4 border-t border-gray-100 space-y-3">
            <label className="block text-xs font-bold text-gray-500 uppercase ml-1">Dokument & Länkar</label>
            
            {/* Lista med sparade dokument */}
            <div className="space-y-2">
              {(dealData.documents || []).map((doc, index) => (
                <div key={index} className="flex items-center justify-between bg-blue-50 p-3 rounded-xl border border-blue-100 group">
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-bold text-blue-900 truncate">{doc.name}</span>
                    <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 truncate hover:underline underline-offset-2">
                      {doc.url}
                    </a>
                  </div>
                  <button 
                    onClick={() => handleRemoveDocument(index)}
                    className="p-2 text-blue-300 hover:text-red-500 transition-colors"
                  >
                    <IconTrash className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Formulär för att lägga till nytt dokument */}
            <div className="p-3 bg-gray-50 rounded-xl border border-dashed border-gray-300 space-y-2">
              <input 
                type="text"
                placeholder="Namn (t.ex. Offert)"
                className="w-full text-sm p-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500"
                value={tempDocName}
                onChange={e => setTempDocName(e.target.value)}
              />
              <div className="flex gap-2">
                <input 
                  type="url"
                  placeholder="Klistra in länk (https://...)"
                  className="flex-1 text-sm p-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500"
                  value={tempDocUrl}
                  onChange={e => setTempDocUrl(e.target.value)}
                />
                <button 
                  type="button"
                  onClick={handleAddDocument}
                  disabled={!tempDocName || !tempDocUrl}
                  className="bg-blue-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-all"
                >
                  Lägg till
                </button>
              </div>
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