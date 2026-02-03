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
  onDeleteActivity,
  onEditActivity
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
      <div className={`bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 flex transition-all duration-300 ${
        showActivities ? 'max-w-4xl w-full' : 'max-w-md w-full'
      }`} style={{ height: '85vh' }}> {/* Tvingar modalen att vara 85% av skärmhöjden */}

        {/* VÄNSTER PANEL */}
        <div className="flex-1 flex flex-col min-w-[400px]">
          {/* Header */}
          <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex-none flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {isEditing ? 'Redigera affär' : 'Skapa ny affärsmöjlighet'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isEditing ? 'Uppdatera detaljerna för denna affär' : 'Lägg till en ny affär på kontot'}
              </p>
            </div>

            {isEditing && (
              <button
                onClick={() => setShowActivities(!showActivities)}
                className={`ml-4 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  showActivities
                  ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {showActivities ? '✕ Dölj logg' : '📋 Visa logg'}
              </button>
            )}
          </div>

          <div className="p-6 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
            {/* Namn-fält */}
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 ml-1">Affärens namn</label>
              <input
                type="text"
                className="w-full border border-gray-200 dark:border-gray-600 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
                placeholder="t.ex. Uppgradering av licenser"
                value={dealData.name || ''}
                onChange={e => setDealData({...dealData, name: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Värde-fält */}
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 ml-1">Värde (SEK)</label>
                <input
                  type="number"
                  className="w-full border border-gray-200 dark:border-gray-600 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
                  value={dealData.value === 0 || dealData.value === '' ? '' : Math.round(dealData.value)}
                  onChange={e => {
                    const val = e.target.value === '' ? '' : parseInt(e.target.value);
                    setDealData({...dealData, value: val});
                  }}
                />
              </div>

              {/* Fas-väljare */}
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 ml-1">Fas</label>
                <select
                  className="w-full border border-gray-200 dark:border-gray-600 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-700 appearance-none cursor-pointer text-gray-900 dark:text-gray-100"
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
            <div className="pt-4 border-t border-gray-100 dark:border-gray-700 space-y-3">
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">Dokument & Länkar</label>
              <div className="space-y-2">
                {(dealData.documents || []).map((doc, index) => (
                  <div key={index} className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/30 p-3 rounded-xl border border-blue-100 dark:border-blue-800 group">
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-bold text-blue-900 dark:text-blue-200 truncate">{doc.name}</span>
                      <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 dark:text-blue-400 truncate hover:underline">
                        {doc.url}
                      </a>
                    </div>
                    <button onClick={() => handleRemoveDocument(index)} className="p-2 text-blue-300 dark:text-blue-600 hover:text-red-500 dark:hover:text-red-400">
                      <IconTrash className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 space-y-2">
                <input
                  type="text"
                  placeholder="Namn (t.ex. Offert)"
                  className="w-full text-sm p-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  value={tempDocName}
                  onChange={e => setTempDocName(e.target.value)}
                />
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://..."
                    className="flex-1 text-sm p-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    value={tempDocUrl}
                    onChange={e => setTempDocUrl(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={handleAddDocument}
                    disabled={!tempDocName || !tempDocUrl}
                    className="bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-bold"
                  >
                    Lägg till
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 bg-gray-50 dark:bg-gray-900 flex items-center justify-between gap-3 border-t border-gray-100 dark:border-gray-700">
            <div className="min-w-[44px]">
              {isEditing && (
                <button
                  onClick={() => window.confirm("Är du säker?") && onDelete()}
                  className="p-3 text-gray-400 dark:text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all"
                >
                  <IconTrash className="w-5 h-5" />
                </button>
              )}
            </div>
            <div className="flex gap-3 flex-1 justify-end">
              <button onClick={onClose} className="px-6 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-bold py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600">
                Avbryt
              </button>
              <button onClick={onSave} className="px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-200 dark:shadow-blue-900/30">
                {isEditing ? 'Uppdatera' : 'Spara'}
              </button>
            </div>
          </div>
        </div>

        {/* HÖGER PANEL: Aktivitetslogg (Visas bara vid redigering och om showActivities är aktivt) */}
        {isEditing && showActivities && (
          <div className="w-[450px] bg-gray-50 dark:bg-gray-900 border-l border-gray-100 dark:border-gray-700 flex flex-col h-full animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <h3 className="font-bold text-gray-800 dark:text-gray-100">Aktiviteter & Historik</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">

              {/* Skapa ny aktivitet */}
              <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h4 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-3 tracking-widest">Logga ny aktivitet</h4>
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
                      if (success.id) {
                        setDealData({
                          ...dealData,
                          activities: [success, ...(dealData.activities || [])]
                        });
                      } else {

                        if (typeof fetchAccounts === 'function') fetchAccounts();
                      }
                    }
                  }}
                />
              </div>

              {/* Aktivitetslogg */}
              <div className="mt-6 border-t dark:border-gray-700 pt-6 flex flex-col">
                <h4 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-3 tracking-widest">Tidigare händelser</h4>
                    <ActivityLog
                      activities={dealData.activities || []}
                      onDeleteActivity={async (id) => {
                        await onDeleteActivity(id);
                        setDealData(prev => ({
                          ...prev,
                          activities: (prev.activities || []).filter(a => a.id !== id)
                        }));
                      }}
                      // Lägg till detta för redigering:
                      onEditActivity={(activity) => {
                        // Vi skickar med en "callback" så att när EditActivityModal sparar,
                        // så uppdateras även vyn här i DealModal direkt.
                        onEditActivity(activity, (updatedActivity) => {
                          setDealData(prev => ({
                            ...prev,
                            activities: (prev.activities || []).map(a =>
                              a.id === updatedActivity.id ? updatedActivity : a
                            )
                          }));
                        });
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
