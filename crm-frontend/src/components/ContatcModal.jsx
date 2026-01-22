import React from 'react';
import ActivityLog from './ActivityLog';

export default function ContactModal({ 
  contact, 
  activities, 
  onClose, 
  isEditing, 
  setIsEditing, 
  editData, 
  setEditData, 
  onUpdate, 
  onDelete,
  onUpdateStatus,
  onDeleteActivity
}) {

  // Om ingen kontakt är vald, rita inte ut någonting
  //console.log("ContactData som skickas till modalen:", contact);
  //console.log("EditData som skickas till modalen:", editData);
  if (!contact) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-all">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/20">

        {/* VARNINGSRUTA FÖR INAKTIV KONTAKT */}
          {!contact.is_active && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg flex justify-between items-center">
              <span className="text-yellow-800 text-sm font-medium">Denna kontakt är inaktiverad.</span>
              <button 
                onClick={() => onUpdateStatus(contact.id, true)}
                className="bg-yellow-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-yellow-700"
              >
                Återaktivera
              </button>
            </div>
          )}
        
        {/* HEADER */}
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
            <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold text-gray-800">
                {isEditing ? "Redigera kontakt" : "Kontaktdetaljer"}
                </h2>
                
                {/* RADERA-KNAPP (Soptunna) */}
                {contact.is_active && !isEditing && (
                <button 
                    onClick={() => onDelete(contact.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors p-1"
                    title="Ta bort kontakt"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                </button>
                )}
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-black text-2xl">&times;</button>
            </div>

        <div className="p-6">
          {!isEditing ? (
            /* --- VISNINGSLÄGE --- */
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Namn</label>
                  <p className="text-lg font-semibold text-gray-800">{contact.first_name} {contact.last_name}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Roll</label>
                  <p className="text-lg text-gray-700">{contact.role || "-"}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">E-post</label>
                  <p>
                    <a 
                      href={`mailto:${contact.email}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                    >
                      {contact.email}
                    </a>
                  </p>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Telefon</label>
                  <p className="text-gray-700">{contact.phone || "-"}</p>
                </div>
              </div>

              <button 
                onClick={() => setIsEditing(true)}
                className="w-full bg-blue-50 text-blue-600 py-2 rounded-lg font-bold hover:bg-blue-100 transition"
              >
                Redigera uppgifter
              </button>

              {/* KONTAKTSPECIFIK HISTORIK */}
              <ActivityLog activities={activities} 
              contactId={contact.id} 
              onDeleteActivity={onDeleteActivity} />
            </div>
          ) : (
            /* --- REDIGERINGSLÄGE --- */
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input className="border p-2 rounded" value={editData.first_name || ''} onChange={e => setEditData({...editData, first_name: e.target.value})} placeholder="Förnamn" />
                <input className="border p-2 rounded" value={editData.last_name || ''} onChange={e => setEditData({...editData, last_name: e.target.value})} placeholder="Efternamn" />
              </div>
              <input className="border p-2 rounded w-full" value={editData.role || ''} onChange={e => setEditData({...editData, role: e.target.value})} placeholder="Roll" />
              <input className="border p-2 rounded w-full" value={editData.phone || ''} onChange={e => setEditData({...editData, phone: e.target.value})} placeholder="Telefon" />
              <input className="border p-2 rounded w-full" value={editData.email || ''} onChange={e => setEditData({...editData, email: e.target.value})} placeholder="E-post" />
              
              <div className="flex gap-2 pt-4">
                <button onClick={onUpdate} className="flex-1 bg-green-600 text-white p-2 rounded font-bold">Spara</button>
                <button onClick={() => setIsEditing(false)} className="flex-1 bg-gray-200 text-gray-700 p-2 rounded font-bold">Avbryt</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}