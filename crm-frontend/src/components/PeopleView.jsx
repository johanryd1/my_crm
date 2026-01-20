import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from './../api'; // Importera din nya konfiguration

export default function PeopleView() {
  const [contacts, setContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Hämta alla kontakter när komponenten laddas
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/contacts/`);
        // Säkerställ att vi alltid sätter en array, även om res.data skulle vara null
        setContacts(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Kunde inte hämta kontakter:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchContacts();
  }, []);

  // Sökfilter - hanterar null/undefined för alla fält
  const filtered = contacts.filter(c => {
    const s = (searchTerm || "").toLowerCase();
    
    const firstName = (c?.first_name || "").toLowerCase();
    const lastName = (c?.last_name || "").toLowerCase();
    const fullName = `${firstName} ${lastName}`;
    const accountName = (c?.account_name || "").toLowerCase();
    const title = (c?.title || "").toLowerCase();

    return (
      fullName.includes(s) || 
      accountName.includes(s) || 
      title.includes(s)
    );
  });

  if (loading) {
    return <div className="text-center py-10 text-gray-500">Laddar personer...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Personer</h2>
        <span className="text-sm text-gray-500 font-medium bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">
          {filtered.length} kontakter
        </span>
      </div>

      {/* Sökfält */}
      <input 
        className="w-full bg-white border border-gray-100 p-4 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-700"
        placeholder="Sök på namn, företag eller titel..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Grid med kontaktkort */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(person => (
          <div key={person.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
            <div className="flex items-start gap-4">
              {/* Initial-cirkel med krasch-skydd */}
              <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg border border-blue-200 shrink-0">
                {person?.first_name || person?.last_name ? (
                  <>
                    {person?.first_name?.charAt(0).toUpperCase()}
                    {person?.last_name?.charAt(0).toUpperCase()}
                  </>
                ) : '?'}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors truncate">
                  {person?.first_name || ""} {person?.last_name || ""}
                </h3>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider italic truncate">
                  {person?.account_name || 'Inget företag'}
                </p>
                {person?.title && (
                  <p className="text-xs text-blue-500 mt-1">{person.title}</p>
                )}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-50 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 font-bold uppercase">E-post</span>
                <a href={`mailto:${person?.email}`} className="text-gray-600 truncate hover:text-blue-500 transition-colors">
                  {person?.email || 'Saknas'}
                </a>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 font-bold uppercase">Telefon</span>
                <a href={`tel:${person?.phone}`} className="text-gray-600 hover:text-blue-500 transition-colors">
                  {person?.phone || 'Saknas'}
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tomt läge */}
      {filtered.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
          <p className="text-gray-400 font-medium">Inga personer hittades.</p>
        </div>
      )}
    </div>
  );
}