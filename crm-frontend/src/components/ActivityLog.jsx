import React from 'react';
import { IconCall, IconEmail, IconMeeting, IconNote, IconTrash } from './Icons';


// Hjälpfunktion för att hämta rätt ikon baserat på ACTIVITY_CHOICES
const getActivityIcon = (type) => {
  switch (type) {
    case 'Call': return <IconCall className="w-4 h-4" />;
    case 'Email': return <IconEmail className="w-4 h-4" />;
    case 'Meeting': return <IconMeeting className="w-4 h-4" />;
    case 'Note': return <IconNote className="w-4 h-4" />;
    default: return <IconNote className="w-4 h-4" />;
  }
};

// Hjälpfunktion för att visa snygga svenska namn
const getLabel = (type) => {
  const labels = {
    'Call': 'Samtal',
    'Email': 'E-Post',
    'Meeting': 'Möte',
    'Note': 'Notering'
  };
  return labels[type] || type;
};

export default function ActivityLog({ activities, contactId = null, onDeleteActivity, onEditActivity }) {
  const filteredActivities = contactId 
    ? activities.filter(a => Number(a.contact) === Number(contactId))
    : activities;

  const sortedActivities = [...filteredActivities].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );

  if (sortedActivities.length === 0) {
    return <p className="text-gray-400 text-sm italic py-4">Inga aktiviteter loggade än.</p>;
  }

  return (
  <div className="mt-10">
    {/* Rubriken ligger utanför scrollen så den alltid syns */}
    <h4 className="text-[10px] font-bold text-gray-400 uppercase mb-3 tracking-widest px-2">
      Tidigare händelser
    </h4>

    {/* Scroll-container med fast max-höjd */}
    <div 
      className="relative px-2 overflow-y-auto overflow-x-hidden custom-scrollbar" 
      style={{ maxHeight: '350px' }}
    >
      <div className="relative space-y-8 py-2">
        {/* Den vertikala linjen */}
        <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-gray-100"></div>

        {sortedActivities.map((a) => {
          const dateObj = new Date(a.date);
          const formattedDateTime = dateObj.toLocaleDateString('sv-SE') + ' ' + 
                                   dateObj.toLocaleTimeString('sv-SE', { 
                                     hour: '2-digit', 
                                     minute: '2-digit' 
                                   });

          return (
            <div key={a.id} className="relative pl-12 group">
              <div className="absolute left-0 p-2 bg-white border border-gray-100 text-blue-500 rounded-full z-10 shadow-sm">
                {getActivityIcon(a.activity_type)}
              </div>
              
              <div className="flex flex-col">
                <div className="flex justify-between items-baseline border-b border-gray-50 pb-1 mb-1">
                  
                  {/* Nu klickbar för redigering */}
                  <button 
                    onClick={() => {
                      console.log("Klickade på aktivitet:", a.id); // <--- LOGGA HÄR
                      if (onEditActivity) {
                        onEditActivity(a);
                      } else {
                        console.warn("onEditActivity finns inte som prop i ActivityLog");
                      }
                    }} 
                    className="text-sm font-bold text-gray-800 hover:text-blue-600 transition-colors cursor-pointer text-left"
                  >
                    {getLabel(a.activity_type)}
                  </button>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-mono text-gray-400">
                      {formattedDateTime}
                    </span>
                    
                    <button
                      onClick={() => onDeleteActivity(a.id)}
                      className="text-gray-300 hover:text-red-500 transition-colors p-1"
                      title="Radera aktivitet"
                    >
                      <IconTrash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {a.note}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </div>
);
}