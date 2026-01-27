import React, { useState } from 'react';

export default function PeopleView({ people, onContactClick, onAccountClick }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' eller 'table'

  // Sökfilter
  const filteredPeople = (people || []).filter(c => {
    const s = (searchTerm || "").toLowerCase();
    const firstName = (c?.first_name || "").toLowerCase();
    const lastName = (c?.last_name || "").toLowerCase();
    const fullName = `${firstName} ${lastName}`;
    const accountName = (c?.account_name || "").toLowerCase();
    const title = (c?.role || "").toLowerCase();

    return fullName.includes(s) || accountName.includes(s) || title.includes(s);
  });

  // Funktion för Excel-export (CSV)
  const exportToExcel = () => {
    const headers = ["Namn,Roll,E-post,Telefon,Konto"];
    const rows = filteredPeople.map(p => 
      `"${p.first_name} ${p.last_name}","${p.role || ''}","${p.email || ''}","${p.phone || ''}","${p.account_name || ''}"`
    );
    
    const csvContent = "\uFEFF" + headers.concat(rows).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `kontakter_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Header & Toggle */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Personer</h2>
          <span className="text-sm text-gray-500">
            {filteredPeople.length} kontakter
          </span>
        </div>

        <div className="flex items-center gap-2 bg-white p-1 rounded-xl shadow-sm border border-gray-100">
          <button 
            onClick={() => setViewMode('grid')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'grid' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            Kort
          </button>
          <button 
            onClick={() => setViewMode('table')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'table' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            Lista
          </button>
          <div className="w-px h-4 bg-gray-200 mx-1" />
          <button 
            onClick={exportToExcel}
            className="px-3 py-1.5 text-xs font-bold text-green-600 hover:bg-green-50 rounded-lg transition-all"
          >
            Export
          </button>
        </div>
      </div>

      {/* Sökfält */}
      <input 
        className="w-full bg-white border border-gray-100 p-4 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-700"
        placeholder="Sök på namn, företag eller roll..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {viewMode === 'grid' ? (
        /* GRID-VY (Originaldesignen) */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPeople.map(person => (
            <div 
              key={person.id} 
              className={`bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group ${
                person.is_active === false ? 'opacity-75 grayscale-[0.3]' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Initial-cirkel */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border shrink-0 ${
                  person.is_active === false 
                    ? 'bg-gray-100 text-gray-400 border-gray-200' 
                    : 'bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 border-blue-200'
                }`}>
                  {person?.first_name || person?.last_name ? (
                    <>
                      {person?.first_name?.charAt(0).toUpperCase()}
                      {person?.last_name?.charAt(0).toUpperCase()}
                    </>
                  ) : '?'}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 
                      onClick={() => onContactClick(person)}
                      className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors truncate cursor-pointer hover:underline"
                    >
                      {person?.first_name || ""} {person?.last_name || ""}
                    </h3>
                    
                    {person.is_active === false && (
                      <span className="bg-red-50 text-red-600 text-[10px] px-1.5 py-0.5 rounded border border-red-100 font-bold uppercase tracking-tighter">
                        Inaktiv
                      </span>
                    )}
                  </div>
                  
                  <p 
                    onClick={() => onAccountClick && onAccountClick(person.account)}
                    className="text-xs text-gray-500 font-medium uppercase tracking-wider italic truncate cursor-pointer hover:text-blue-500"
                  >
                    {person?.account_name || 'Inget företag'}
                  </p>
                  
                  {person?.role && (
                    <p className="text-xs text-blue-500 mt-1">{person.role}</p>
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
      ) : (
        /* TABELL-VY */
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Namn</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Roll</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Konto</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">E-post</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Telefon</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredPeople.map(person => (
                  <tr key={person.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="p-4">
                      <button 
                        onClick={() => onContactClick(person)}
                        className="font-bold text-gray-800 hover:text-blue-600 hover:underline text-sm text-left"
                      >
                        {person.first_name} {person.last_name}
                      </button>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{person.role || '-'}</td>
                    <td className="p-4">
                      <button 
                        onClick={() => onAccountClick && onAccountClick(person.account)}
                        className="text-sm text-blue-500 hover:underline font-medium text-left"
                      >
                        {person.account_name}
                      </button>
                    </td>
                    <td className="p-4 text-sm text-gray-600 italic font-light">{person.email || '-'}</td>
                    <td className="p-4 text-sm text-gray-600">{person.phone || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tomt läge */}
      {filteredPeople.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
          <p className="text-gray-400 font-medium">Inga personer hittades.</p>
        </div>
      )}
    </div>
  );
}