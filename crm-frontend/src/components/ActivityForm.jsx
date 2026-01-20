import React, { useState } from 'react';
import { IconCall, IconEmail, IconMeeting, IconNote } from './Icons';

export default function ActivityForm({ onAddActivity, contacts }) {
  const [note, setNote] = useState('');
  const [activityType, setActivityType] = useState('Call');
  const [contactId, setContactId] = useState(''); // Nytt state för vald kontakt

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!note.trim()) return;

    onAddActivity({
      note: note,
      activity_type: activityType,
      contact: contactId || null // Skicka med kontakten (eller null om ingen valts)
    });

    setNote('');
    setContactId(''); // Nollställ efter sparning
  };

  const types = [
    { id: 'Call', label: 'Samtal', Icon: IconCall },
    { id: 'Email', label: 'E-post', Icon: IconEmail },
    { id: 'Meeting', label: 'Möte', Icon: IconMeeting },
    { id: 'Note', label: 'Notering', Icon: IconNote },
  ];

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4">
      <div className="space-y-4">
        {/* TYP AV AKTIVITET */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Logga ny aktivitet</label>
          <div className="grid grid-cols-4 gap-2">
            {types.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setActivityType(type.id)}
                className={`flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all ${
                  activityType === type.id
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'
                }`}
              >
                <type.Icon className="w-5 h-5 mb-1" />
                <span className="text-[10px] font-bold uppercase">{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* KOPPLA TILL KONTAKT */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Vem pratade du med? (Valfritt)</label>
          <select
            className="w-full border border-gray-200 p-2 rounded-lg bg-gray-50 text-sm outline-none focus:ring-2 focus:ring-green-500 transition-all"
            value={contactId}
            onChange={(e) => setContactId(e.target.value)}
          >
            <option value="">Välj kontakt...</option>
            {contacts
              .filter(c => c.is_active) // Visa bara aktiva kontakter i listan
              .map(c => (
                <option key={c.id} value={c.id}>
                  {c.first_name} {c.last_name}
                </option>
              ))
            }
          </select>
        </div>
      </div>

      <textarea
        className="w-full border border-gray-200 p-3 rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all text-sm min-h-[80px]"
        placeholder="Vad hände? Skriv en kort notering..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

      <button
        type="submit"
        disabled={!note.trim()}
        className="w-full bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 disabled:opacity-50 transition-colors shadow-sm"
      >
        Spara aktivitet
      </button>
    </form>
  );
}