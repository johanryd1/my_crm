// EditActivityModal.jsx

import React, { useState, useEffect } from 'react';

// Se till att det står "export default function" här
export default function EditActivityModal({ isOpen, activity, onClose, onSave, contacts }) {
  // 1. Initialisera state
  const [data, setData] = useState(activity);


  // Felsökning: Logga vad modalen ser vid varje rendering
  console.log("--- EditActivityModal Debug ---");
  console.log("isOpen:", isOpen);
  console.log("Antal kontakter mottagna:", contacts?.length);
  console.log("Nuvarande aktivitet:", activity);
  console.log("Valt kontakt-ID i state:", data?.contact);

  // 2. Uppdatera state när aktiviteten ändras
  useEffect(() => {
    if (activity) {
      setData(activity);
    }
  }, [activity]);

  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Redigera aktivitet</h3>
          <button onClick={onClose} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">✕</button>
        </div>

        {/* Innehåll */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 ml-1">Typ av aktivitet</label>
            <select
              className="w-full border border-gray-200 dark:border-gray-600 p-2.5 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-500"
              value={data.activity_type || 'note'}
              onChange={e => setData({...data, activity_type: e.target.value})}
            >
              <option value="call">SAMTAL</option>
              <option value="email">E-POST</option>
              <option value="meeting">MÖTE</option>
              <option value="note">NOTERING</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 ml-1">
                Kontaktperson
            </label>
            <select
                className="w-full border border-gray-200 dark:border-gray-600 p-2.5 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                // Vi tvingar ID:t till en sträng för att matcha HTML-option värdet perfekt
                value={data.contact ? String(data.contact) : ""}
                onChange={e => setData({...data, contact: e.target.value})}
            >
                <option value="">Välj kontakt...</option>
                {Array.isArray(contacts) && contacts.map(c => (
                <option key={c.id} value={String(c.id)}>
                    {c.first_name} {c.last_name}
                </option>
                ))}
            </select>
            </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 ml-1">Anteckning</label>
            <textarea
              className="w-full border border-gray-200 dark:border-gray-600 p-3 rounded-xl min-h-[180px] text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              value={data.note || ''}
              onChange={e => setData({...data, note: e.target.value})}
              placeholder="Skriv detaljerade anteckningar här..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900 flex justify-end gap-3 border-t dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-5 py-2 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-all"
          >
            Avbryt
          </button>
          <button
            onClick={() => onSave(data)}
            className="px-8 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-blue-900/30 transition-all"
          >
            Spara ändringar
          </button>
        </div>
      </div>
    </div>
  );
}
