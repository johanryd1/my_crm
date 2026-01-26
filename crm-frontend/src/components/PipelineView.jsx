import React, { useState } from 'react';
import { 
  DndContext, 
  closestCorners, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  DragOverlay,
  useDroppable,
  useDraggable 
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { DollarSign } from './Icons'; // Din specifika import

// --- KOMPONENT FÖR ETT KORT (DRAGGABLE) ---
const DealCard = ({ deal, phaseColor, onEdit, isOverlay = false }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: deal.id.toString(),
    data: { deal }
  });

  // Om det är ett overlay-kort (det man drar) vill vi inte ha dnd-stilen här
  // utan vi styr det från föräldern.
  const style = isOverlay ? undefined : {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.3 : 1, // Gör originalet blekt medan man drar
    cursor: 'grab'
  };

  const lightBg = `${phaseColor}15`;

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...listeners} 
      {...attributes}
      onClick={() => !isOverlay && onEdit(deal)}
      className={`bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:border-blue-400 transition-all group relative overflow-hidden mb-3 ${isOverlay ? 'shadow-2xl border-blue-500' : ''}`}
    >
      <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: phaseColor }} />
      <p className="text-[10px] uppercase text-gray-400 font-bold mb-1 tracking-wider">{deal.accountName}</p>
      <h4 className="font-bold text-gray-900 group-hover:text-blue-600 mb-2">{deal.name}</h4>
      <div className="flex justify-between items-center">
        <span className="text-sm font-black text-gray-700">
          {new Intl.NumberFormat('sv-SE').format(deal.value)} kr
        </span>
        <div className="p-1.5 rounded" style={{ backgroundColor: lightBg, color: phaseColor }}>
          <DollarSign className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};

// --- KOMPONENT FÖR EN KOLUMN (DROPPABLE) ---
const PhaseColumn = ({ phase, deals, onEditDeal }) => {
  const { setNodeRef, isOver } = useDroppable({ 
    id: phase.id.toString() 
  });
  
  const totalValue = deals.reduce((sum, d) => sum + Number(d.value), 0);

  return (
    <div 
      ref={setNodeRef} 
      className={`flex-shrink-0 w-72 flex flex-col rounded-xl border transition-colors h-full ${
        isOver ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
      }`}
    >
      <div 
        className="p-4 border-b border-gray-200 bg-white rounded-t-xl border-t-4" 
        style={{ borderTopColor: phase.color }}
      >
        <h3 className="font-bold text-gray-800 flex justify-between items-center">
          {phase.name}
          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: `${phase.color}15`, color: phase.color }}>
            {deals.length}
          </span>
        </h3>
        <p className="text-sm font-black mt-1" style={{ color: phase.color }}>
          {new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK', maximumFractionDigits: 0 }).format(totalValue)}
        </p>
      </div>
      <div className="p-3 overflow-y-auto flex-1">
        {deals.map(deal => (
          <DealCard key={deal.id} deal={deal} phaseColor={phase.color} onEdit={onEditDeal} />
        ))}
      </div>
    </div>
  );
};

// --- HUVUDKOMPONENT ---
const PipelineView = ({ phases, accounts, onEditDeal, onUpdateDealPhase }) => {
  const [activeDeal, setActiveDeal] = useState(null);

  // Sensorer för att hantera klick vs drag (5px rörelse krävs innan drag startar)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );


const allDeals = accounts.flatMap(acc => 
  (acc.deals || []).map(deal => ({ 
    ...deal, 
    accountName: acc.name,
    account: acc.id // LÄGG TILL DENNA RAD!
  }))
);

  const handleDragStart = (event) => {
    const { active } = event;
    const deal = allDeals.find(d => d.id.toString() === active.id);
    setActiveDeal(deal);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveDeal(null);

    if (!over) return;

    const dealId = active.id;
    const newPhaseId = over.id;

    // Hitta dealen i vår samlade lista
    const deal = allDeals.find(d => d.id.toString() === dealId.toString());

    if (deal && deal.stage.toString() !== newPhaseId.toString()) {
      onUpdateDealPhase(dealId, newPhaseId);
    }
  };

  return (
    <DndContext 
      sensors={sensors} 
      collisionDetection={closestCorners} 
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-200px)] min-h-[500px]">
        {phases.map(phase => (
          <PhaseColumn 
            key={phase.id} 
            phase={phase} 
            deals={allDeals.filter(d => d.stage.toString() === phase.id.toString())} 
            onEditDeal={onEditDeal}
          />
        ))}
      </div>

      {/* Denna komponent renderar kortet "utanför" kolumnerna medan man drar */}
      <DragOverlay zIndex={1000}>
        {activeDeal ? (
          <div className="w-72 transform rotate-2 cursor-grabbing">
            <DealCard 
              deal={activeDeal} 
              phaseColor={phases.find(p => p.id === activeDeal.stage)?.color || '#3b82f6'} 
              isOverlay={true}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default PipelineView;