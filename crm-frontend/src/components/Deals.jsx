import React from 'react';
import { DollarSign } from './Icons';

const Deals = ({ selectedAccount, dealPhases, onAddDeal }) => {
  // 1. Säkerhetskontroll: Om dealPhases inte har laddats än, visa en laddningsindikator
  if (!dealPhases || dealPhases.length === 0) {
    return <div className="py-8 text-center text-gray-500">Laddar faser...</div>;
  }

  const getPhaseDetails = (phaseId) => {
    // 2. Använd valfri kedja (?.) för extra säkerhet
    const phase = dealPhases.find(p => p.id === phaseId);
    return phase || { name: 'Ingen fas', color: '#94a3b8' }; // Standardgrå om fas saknas
  };

  const deals = selectedAccount.deals || [];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Affärsmöjligheter</h3>
          <p className="text-sm text-gray-500">Hanterar pågående och avslutade affärer för {selectedAccount.name}</p>
        </div>
        <button 
        onClick={onAddDeal} // Använd propen här
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-all flex items-center gap-2"
        >
        <span>+</span> Ny affär
        </button>
      </div>

      {deals.length > 0 ? (
        <div className="grid gap-3">
          {deals.map((deal) => {
            const phase = getPhaseDetails(deal.stage);
            return (
              <div 
                key={deal.id} 
                className="group flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <DollarSign size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{deal.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span 
                        className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full border"
                        style={{ backgroundColor: `${phase.color}10`, color: phase.color, borderColor: `${phase.color}40` }}
                      >
                        {phase.name}
                      </span>
                      <span className="text-xs text-gray-400">Uppdaterad nyss</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-lg font-black text-gray-900">
                    {new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK', maximumFractionDigits: 0 }).format(deal.value)}
                  </p>
                  <p className="text-xs text-gray-400">Beräknat värde</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-4 text-gray-400">
            <DollarSign size={24} />
          </div>
          <p className="text-gray-500 font-medium">Inga affärer registrerade än.</p>
          <button className="mt-4 text-blue-600 font-bold text-sm hover:underline">
            Klicka här för att skapa den första
          </button>
        </div>
      )}
    </div>
  );
};

export default Deals;