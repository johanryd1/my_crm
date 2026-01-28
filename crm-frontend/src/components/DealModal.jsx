import React, { useState } from 'react';
import { IconTrash } from './Icons'; 
import ActivityLog from './ActivityLog';
import ActivityForm from './ActivityForm';

const DealModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  onDelete, 
  dealData, 
  setDealData, 
  phases, 
  isEditing,
  contacts = [],
  onAddActivity,
  onDeleteActivity
}) => {
  const [tempDocName, setTempDocName] = useState('');
  const [tempDocUrl, setTempDocUrl] = useState('');

  // Filtrera fram kontakter som tillhör samma konto som affären
  const dealContacts = contacts ? contacts.filter(c => Number(c.account) === Number(dealData.account)) : [];

  // State för att styra om aktivitets-panelen ska visas
  const [showActivities, setShowActivities] = useState(false);

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
      {/* Modalen växer i bredd när showActivities är true */}
      <div className={`bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200 flex transition-all duration-300 ${
        showActivities ? 'max-w-4xl w-full' : 'max-w-md w-full'
      }`}>
        
        {/* VÄNSTER PANEL: Deal-info */}
        <div className="flex-1 flex flex-col min-w-[400px]">
          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {isEditing ? 'Redigera affär' : 'Skapa ny affärsmöjlighet'}
              </h2>
              <p className="text-sm text-gray-500">
                {isEditing ? 'Uppdatera detaljerna för denna affär' : 'Lägg till en ny affär på kontot'}
              </p>
            </div>
            {isEditing && (
              <button 
                onClick={() => setShowActivities(!showActivities)}
                className={`ml-4 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  showActivities 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {showActivities ? '✕ Dölj logg' : '📋 Visa logg'}
              </button>
            )}
          </div>
          
          <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
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
                  value={dealData.value === 0 || dealData.value === '' ? '' : Math.round(dealData.value)}
                  onChange={e => {
                    const val = e.target.value === '' ? '' : parseInt(e.target.value);
                    setDealData({...dealData, value: val});
                  }}
                />
              </div>

              {/* Fas-väljare */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Fas</label>
                <select 
                  className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white appearance-none cursor-pointer text-gray-900"
                  value={dealData.stage}
                  onChange={e => setDealData({...dealData, stage: e.target.value})}
                >
                  {phases.map(phase => (
                    <option key={phase.id} value={phase.id}>{phase.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Dokument-sektion */}
            <div className="pt-4 border-t border-gray-100 space-y-3">
              <label className="block text-xs font-bold text-gray-500 uppercase ml-1">Dokument & Länkar</label>
              <div className="space-y-2">
                {(dealData.documents || []).map((doc, index) => (
                  <div key={index} className="flex items-center justify-between bg-blue-50 p-3 rounded-xl border border-blue-100 group">
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-bold text-blue-900 truncate">{doc.name}</span>
                      <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 truncate hover:underline">
                        {doc.url}
                      </a>
                    </div>
                    <button onClick={() => handleRemoveDocument(index)} className="p-2 text-blue-300 hover:text-red-500">
                      <IconTrash className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-dashed border-gray-300 space-y-2">
                <input 
                  type="text"
                  placeholder="Namn (t.ex. Offert)"
                  className="w-full text-sm p-2 rounded-lg border border-gray-200"
                  value={tempDocName}
                  onChange={e => setTempDocName(e.target.value)}
                />
                <div className="flex gap-2">
                  <input 
                    type="url"
                    placeholder="https://..."
                    className="flex-1 text-sm p-2 rounded-lg border border-gray-200"
                    value={tempDocUrl}
                    onChange={e => setTempDocUrl(e.target.value)}
                  />
                  <button 
                    type="button"
                    onClick={handleAddDocument}
                    disabled={!tempDocName || !tempDocUrl}
                    className="bg-blue-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg text-sm font-bold"
                  >
                    Lägg till
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 bg-gray-50 flex items-center justify-between gap-3 border-t border-gray-100">
            <div className="min-w-[44px]">
              {isEditing && (
                <button 
                  onClick={() => window.confirm("Är du säker?") && onDelete()}
                  className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                >
                  <IconTrash className="w-5 h-5" />
                </button>
              )}
            </div>
            <div className="flex gap-3 flex-1 justify-end">
              <button onClick={onClose} className="px-6 bg-white border border-gray-200 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-100">
                Avbryt
              </button>
              <button onClick={onSave} className="px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-200">
                {isEditing ? 'Uppdatera' : 'Spara'}
              </button>
            </div>
          </div>
        </div>

        {/* HÖGER PANEL: Aktivitetslogg (Visas bara vid redigering och om showActivities är aktivt) */}
        {isEditing && showActivities && (
          <div className="w-[450px] bg-gray-50 border-l border-gray-100 flex flex-col h-full animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-gray-200 bg-white">
              <h3 className="font-bold text-gray-800">Aktiviteter & Historik</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase mb-3 tracking-widest">Logga ny aktivitet</h4>
                <ActivityForm 
                  contacts={dealContacts} 
                  dealId={dealData.id}
                  onAddActivity={async (activityData) => {
                    const payload = {
                      ...activityData,
                      deal: dealData.id,
                      account: dealData.account 
                    };

                    const success = await onAddActivity(payload);

                    if (success) {
                      // ISTÄLLET FÖR onSave(): 
                      // Vi uppdaterar dealData lokalt så att den nya aktiviteten syns i loggen direkt
                      // 'success' bör i din App.jsx returnera den skapade aktiviteten från backend
                      
                      // Om din addActivity i App.jsx returnerar res.data (den nya aktiviteten):
                      if (success.id) { 
                        setDealData({
                          ...dealData,
                          activities: [success, ...(dealData.activities || [])]
                        });
                      } else {
                        // Om den bara returnerar true/false, anropa fetchAccounts för att hämta ny data i bakgrunden
                        // men utan att stänga modalen!
                        if (typeof fetchAccounts === 'function') fetchAccounts();
                      }
                    }
                  }}
                />
              </div>
              <div>
                <h4 className="text-[10px] font-bold text-gray-400 uppercase mb-3 tracking-widest">Tidigare händelser</h4>
                <ActivityLog 
                  activities={dealData.activities || []} 
                  onDeleteActivity={async (id) => {
                    // 1. Kör själva raderingen i App.jsx
                    await onDeleteActivity(id);
                    
                    // 2. Uppdatera dealData lokalt i modalen direkt
                    // Detta gör att aktiviteten försvinner framför ögonen på dig
                    setDealData(prev => ({
                      ...prev,
                      activities: prev.activities.filter(a => a.id !== id)
                    }));
                  }} 
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DealModal;