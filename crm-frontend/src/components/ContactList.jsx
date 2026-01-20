import React, { useState } from 'react';

export default function ContactList({ contacts, onContactClick }) {
  const [showInactive, setShowInactive] = useState(false);

  const filteredContacts = contacts.filter(c => showInactive || c.is_active);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Lead': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Customer': return 'bg-green-50 text-green-600 border-green-100';
      case 'Prospect': return 'bg-purple-50 text-purple-600 border-purple-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center px-1">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">
          Kontakter ({filteredContacts.length})
        </h2>
        <button 
          onClick={() => setShowInactive(!showInactive)}
          className="text-xs font-semibold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-full transition-colors"
        >
          {showInactive ? "Visa endast aktiva" : "Visa inaktiva"}
        </button>
      </div>

      {/* Kort-lista */}
      <div className="grid gap-3">
        {filteredContacts.length === 0 ? (
          <div className="bg-white p-10 rounded-xl border border-dashed border-gray-200 text-center text-gray-400 italic">
            Inga kontakter hittades.
          </div>
        ) : (
          filteredContacts.map(contact => (
            <div 
              key={contact.id}
              onClick={() => onContactClick(contact)}
              className={`group bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer relative overflow-hidden ${
                !contact.is_active ? 'opacity-75 grayscale-[0.3]' : ''
              }`}
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

              <div className="flex justify-between items-start">
                <div className="flex gap-4">
                  {/* Avatar */}
                  <div className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-base border ${getStatusStyle(contact.status)}`}>
                    {contact.first_name[0]}{contact.last_name[0]}
                  </div>

                  <div className="space-y-1">
                    <div>
                      <span className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors mr-2">
                        {contact.first_name} {contact.last_name}
                      </span>
                      {/* Roll/Titel */}
                      {contact.role && (
                        <span className="text-[11px] font-medium text-gray-400 uppercase tracking-tight italic">
                          • {contact.role}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-0.5">
                      <div className="text-xs text-gray-500 flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 text-gray-400">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                        </svg>
                        {contact.email}
                      </div>
                      
                      {/* Telefonnummer */}
                      {contact.phone && (
                        <div className="text-xs text-gray-500 flex items-center gap-1.5">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 text-gray-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                          </svg>
                          {contact.phone}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusStyle(contact.status)}`}>
                    {contact.status}
                  </span>
                  {!contact.is_active && (
                    <span className="text-[9px] text-red-500 font-black uppercase tracking-tighter">
                      Inaktiv
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}