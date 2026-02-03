import { useState, useEffect } from 'react'
import axios from 'axios'
import logo from './assets/CareViaMariaLogo.png'; // Importera bild
import ContactModal from './components/ContatcModal';
import ActivityLog from './components/ActivityLog';
import ActivityForm from './components/ActivityForm';
import ContactList from './components/ContactList';
import ContactForm from './components/ContactForm';
import Settings from './components/Settings';
import PeopleView from './components/PeopleView';
import EditActivityModal from './components/EditActivityModal';
import Deals from './components/Deals';
import DealModal from './components/DealModal';
import PipelineView from './components/PipelineView'; 
import { IconCall, IconEmail, IconMeeting, IconNote, IconTrash, SettingsIcon, CRMIcon, ActivityIcon, DollarSign, IconSun, IconMoon } from './components/Icons';
import API_BASE_URL from './api'; // Importera din nya konfiguration

function App() {
  // --- STATES ---
  const [isEditing, setIsEditing] = useState(false);
  const [editAccount, setEditAccount] = useState({});
  const [editingDealId, setEditingDealId] = useState(null);
  const [accounts, setAccounts] = useState([])
  const [newName, setNewName] = useState('')
  const [selectedAccount, setSelectedAccount] = useState(null)
  const [contacts, setContacts] = useState([])
  // const [newContact, setNewContact] = useState({ first_name: '', last_name: '', email: '', phone: '', role: '' })
  const [activities, setActivities] = useState([]);
  const [phaseFilter, setPhaseFilter] = useState('all');
  const [selectedContact, setSelectedContact] = useState(null);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [deals, setDeals] = useState([]);
  const [editContactData, setEditContactData] = useState({
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  role: ''
});
const [phases, setPhases] = useState([]);
const [showInactive, setShowInactive] = useState(false);
const [view, setView] = useState('dashboard'); // 'dashboard' eller 'settings'
const [newActivity, setNewActivity] = useState({ 
  note: '', 
  activity_type: 'Call', // Standardval
  contact: '' // För att kunna koppla till en specifik person
});
const [searchTerm, setSearchTerm] = useState('')
const [activeTab, setActiveTab] = useState('deals'); // 'contacts' eller 'activities'

// Theme state - initialize from localStorage or system preference
const [theme, setTheme] = useState(() => {
  if (typeof window !== 'undefined') {
    return localStorage.theme || 'auto';
  }
  return 'auto';
});

// Apply theme to document
useEffect(() => {
  const root = document.documentElement;
  if (theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  if (theme !== 'auto') {
    localStorage.theme = theme;
  } else {
    localStorage.removeItem('theme');
  }
}, [theme]);

const toggleTheme = () => {
  setTheme(prev => prev === 'dark' ? 'light' : 'dark');
};

// I App.jsx
const [editingActivity, setEditingActivity] = useState(null);
const [showActivityEditModal, setShowActivityEditModal] = useState(false);

const openEditActivityModal = (activity) => {
  console.log("App.jsx tog emot aktivitet för redigering:", activity); // <--- LOGGA HÄR
  setEditingActivity(activity);
  setShowActivityEditModal(true);
};

const [showDealModal, setShowDealModal] = useState(false);
const [newDeal, setNewDeal] = useState({
  name: '',
  value: '',
  stage: phases[0]?.id || '' // Sätter första tillgängliga fas som förval
});

const handleOpenNewDealModal = () => {
  // 1. Nollställ ID:t så appen vet att det inte är en redigering
  setEditingDealId(null);
  
  // 2. Nollställ newDeal med tomma startvärden
  setNewDeal({
    name: '',
    value: 0,
    phase: phases[0]?.id || '', // Sätt till första fasen om möjligt
    account: selectedAccount?.id || '', // Förvinställ kontot om ett är valt
    activities: []
  });
  
  // 3. Öppna modalen
  setShowDealModal(true);
};

const updateActivity = async (updatedData) => {
  try {
    const res = await axios.put(`${API_BASE_URL}/api/activities/${updatedData.id}/`, updatedData);
    
    // 1. Uppdatera globala listan
    setActivities(prev => prev.map(a => a.id === updatedData.id ? res.data : a));
    
    // 2. Uppdatera accounts-state (för att modalen ska visa rätt direkt)
    await fetchAccounts(); 
    
    setShowActivityEditModal(false);
  } catch (err) {
    console.error("Kunde inte uppdatera aktivitet:", err);
  }
};

const handleUpdateDealPhase = async (dealId, newPhaseId) => {
  console.log(`Flyttar deal ${dealId} till fas ${newPhaseId}`);

  // 1. Skapa en kopia av accounts där vi flyttat dealen (Optimistic UI)
  const updatedAccounts = accounts.map(acc => {
    return {
      ...acc,
      // Mappa igenom dealsen i varje konto
      deals: acc.deals?.map(d => {
        if (d.id.toString() === dealId.toString()) {
          return { ...d, stage: parseInt(newPhaseId) }; // Uppdatera fasen
        }
        return d;
      })
    };
  });

  // 2. Uppdatera statet direkt så kortet "fastnar" i nya kolumnen
  setAccounts(updatedAccounts);

  // 3. Skicka ändringen till databasen (Supabase/Django)
  try {
    const response = await fetch(`${API_BASE_URL}/api/deals/${dealId}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage: parseInt(newPhaseId) })
    });

    if (!response.ok) {
      throw new Error("Kunde inte spara i databasen");
    }
    console.log("Fas uppdaterad i databasen!");
  } catch (err) {
    console.error("Fel vid uppdatering:", err);
    // Om det skiter sig, hämta om datan för att återställa korrekt läge
    fetchAccounts(); 
  }
};

// För att skapa NY
const openCreateDealModal = () => {
  setEditingDealId(null); // Viktigt för att isEditing ska bli false
  setNewDeal({ 
    name: '', 
    value: '', 
    stage: phases[0]?.id || '' 
  });
  setShowDealModal(true);
};

// För att REDIGERA
const openEditDealModal = (deal) => {
  // 1. Hitta den absolut senaste versionen av affären från ditt huvud-state (accounts)
  // Vi letar i 'accounts' eftersom fetchAccounts uppdaterar just den listan.
  const account = accounts.find(a => a.id === deal.account);
  const freshDeal = account?.deals?.find(d => d.id === deal.id) || deal;

  // 2. Sätt ID:t och den FÄRSKA affären i statet
  setEditingDealId(freshDeal.id);
  setNewDeal(freshDeal); 
  setShowDealModal(true);

  // 3. Uppdatera i bakgrunden (valfritt men bra för nästa gång)
  if (typeof fetchAccounts === 'function') {
    fetchAccounts();
  }
};

const handleCreateDeal = async () => {
  try {
    const payload = {
      ...newDeal,
      account: selectedAccount.id // Kopplar affären till rätt konto
    };

    const res = await axios.post(`${API_BASE_URL}/api/deals/`, payload, {
      headers: { Authorization: `Token ${localStorage.getItem('token')}` }
    });

    // Uppdatera lokalt state så att affären syns direkt
    const updatedAccount = {
      ...selectedAccount,
      deals: [...(selectedAccount.deals || []), res.data]
    };
    
    setSelectedAccount(updatedAccount); // Uppdaterar vyn
    setShowDealModal(false); // Stäng modalen
    setNewDeal({ name: '', value: '', stage: phases[0]?.id || '' }); // Nollställ
  } catch (err) {
    console.error("Kunde inte skapa affär:", err);
    alert("Något gick fel när affären skulle sparas.");
  }
};

const fetchDeals = async () => {
  try {
    const response = await fetch('http://localhost:8000/api/deals/', {
      headers: { 'Authorization': `Token ${localStorage.getItem('token')}` }
    });
    const data = await response.json();
    setDeals(data);
  } catch (error) {
    console.error("Fel vid hämtning av deals:", error);
  }
};

const fetchContacts = async (accountId = null) => {
  try {
    const res = await axios.get(`${API_BASE_URL}/api/contacts/`);
    
    if (accountId) {
      // Om vi skickat med ett ID (t.ex. när vi klickat på ett företag)
      const filtered = res.data.filter(c => c.account === accountId);
      setContacts(filtered);
    } else {
      // Om inget ID skickas med (t.ex. för PeopleView), spara ALLA
      setContacts(res.data);
    }
  } catch (err) {
    console.error("Kunde inte hämta kontakter:", err);
  }
};

const handleSaveDeal = async () => {
  try {
    // 1. Identifiera vilket konto affären tillhör.
    // Om vi är i Pipeline-vyn finns kontot redan på newDeal.account.
    // Om vi är inne på ett specifikt konto tar vi det från selectedAccount.
    const accountId = selectedAccount ? selectedAccount.id : newDeal.account;

    if (!accountId) {
      alert("Kunde inte hitta vilket konto affären tillhör.");
      return;
    }

    const payload = { 
      ...newDeal, 
      account: accountId,
      documents: newDeal.documents || [],
      stage: parseInt(newDeal.stage || phases[0]?.id),
      value: parseFloat(newDeal.value) || 0
    };

    let response;
    const config = { 
      headers: { Authorization: `Token ${localStorage.getItem('token')}` } 
    };

    if (editingDealId) {
      response = await axios.put(
        `${API_BASE_URL}/api/deals/${editingDealId}/`, 
        payload, 
        config
      );

      // Uppdatera selectedAccount lokalt om det finns öppet
      if (selectedAccount && selectedAccount.id === accountId) {
        const updatedDeals = selectedAccount.deals.map(d => 
          d.id === editingDealId ? response.data : d
        );
        setSelectedAccount({ ...selectedAccount, deals: updatedDeals });
      }
      
    } else {
      response = await axios.post(
        `${API_BASE_URL}/api/deals/`, 
        payload, 
        config
      );

      // Lägg till lokalt i selectedAccount om det är öppet
      if (selectedAccount && selectedAccount.id === accountId) {
        setSelectedAccount({ 
          ...selectedAccount, 
          deals: [...(selectedAccount.deals || []), response.data] 
        });
      }
    }

    // 2. Uppdatera den globala accounts-listan (Viktigt för Pipeline-vyn!)
    setAccounts(prevAccounts => prevAccounts.map(acc => {
      if (acc.id === accountId) {
        const currentDeals = editingDealId 
          ? acc.deals.map(d => d.id === editingDealId ? response.data : d)
          : [...(acc.deals || []), response.data];
        return { ...acc, deals: currentDeals };
      }
      return acc;
    }));

    setShowDealModal(false);
    setEditingDealId(null);
    setNewDeal({ name: '', value: '', stage: phases[0]?.id || '' });

  } catch (err) {
    console.error("Kunde inte spara affären:", err);
    const errorMsg = err.response?.data ? JSON.stringify(err.response.data) : "Kontrollera fälten.";
    alert("Något gick fel: " + errorMsg);
  }
};

// --- HÄMTA DATA VID START OCH VID VY-BYTE ---
    useEffect(() => {
    // Nollställ val vid vy-byte - MEN bara om vi inte går TILL dashboarden
    // Det gör att onAccountClick kan sätta ett konto och sen byta vy utan att det rensas
    if (view !== 'dashboard') {
      setSelectedAccount(null);
    }
    
    setSelectedContact(null);
    setIsEditing(false);

    fetchContacts(); 
    fetchAccounts();
    fetchPhases();
  }, [view]);

  // --- FUNKTIONER ---
  
  // Hämta alla företag
  const fetchAccounts = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/accounts/`);

      setAccounts(res.data)
    } catch (err) {
      console.error("Kunde inte hämta konton:", err)
    }
  }

  // Hämta faser från API
const fetchPhases = async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}/api/deal-phases/`);
    // Sortera efter 'order' så de kommer i rätt ordning
    setPhases(res.data.sort((a, b) => a.order - b.order));
  } catch (err) {
    console.error("Kunde inte hämta faser", err);
  }
};

// Skapa nytt företag
const fetchActivities = async (accountId) => {
  try {
    const res = await axios.get(`${API_BASE_URL}/api/activities/`);
    console.log("Alla aktiviteter från API:", res.data); // Kolla här!
      const filtered = res.data.filter(a => Number(a.account) === Number(accountId));
      console.log("Filtrerade aktiviteter för konto", accountId, ":", filtered);
      setActivities(filtered);
    } catch (err) {
      console.error("Fel vid hämtning av aktiviteter:", err);
    }
  };

 /*  const addActivity = async (activityData) => {
  try {
    const res = await axios.post(`${API_BASE_URL}/api/activities/`, {
      ...activityData, // Här kommer 'note' och 'activity_type' från formuläret
      account: selectedAccount.id,
      date: new Date().toISOString().split('T')[0]
    });
    
    // Uppdatera listan så den nya aktiviteten syns direkt
    setActivities([res.data, ...activities]);
  } catch (err) {
    console.error("Kunde inte spara aktivitet:", err);
  }
}; */

const addActivity = async (activityData) => {
  try {
    const res = await axios.post(`${API_BASE_URL}/api/activities/`, {
      ...activityData,
      date: new Date().toISOString().split('T')[0]
    });
    
    const newActivity = res.data;

    // 1. Uppdatera den globala aktivitetslistan för omedelbar feedback
    setActivities(prev => [newActivity, ...prev]);

    // 2. Uppdatera 'newDeal' så att loggen i den ÖPPNA modalen uppdateras direkt
    setNewDeal(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        activities: [newActivity, ...(prev.activities || [])]
      };
    });

    // 3. VATTENTÄT SYNK: Hämta om all data från databasen.
    // Detta uppdaterar 'accounts'-staten i bakgrunden så att 
    // allt är korrekt när du stänger och öppnar modalen igen.
    if (typeof fetchAccounts === 'function') {
      await fetchAccounts();
    }

    return newActivity; 
  } catch (err) {
    console.error("Kunde inte spara aktivitet:", err);
    alert("Kunde inte spara aktiviteten i databasen.");
    return false;
  }
};
  
const deleteActivity = async (activityId) => {
  if (!window.confirm("Vill du verkligen ta bort denna aktivitet permanent?")) return;

  try {
    // 1. Radera i din lokala Postgres via Django
    await axios.delete(`${API_BASE_URL}/api/activities/${activityId}/`);
    
    // 2. Uppdatera den enkla aktivitetslistan direkt (för vyn på kontosidan)
    setActivities(prev => prev.filter(a => a.id !== activityId));

    // 3. VIKTIGT: Hämta om ALL data från backend (fetchAccounts)
    // Detta gör att din 'accounts'-state och alla dess nästlade 'deals' 
    // uppdateras med färsk data från Postgres där aktiviteten nu är borta.
    if (typeof fetchAccounts === 'function') {
      await fetchAccounts();
    }

    // 4. Om modalen är öppen, se till att även 'newDeal' rensas
    setNewDeal(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        activities: (prev.activities || []).filter(a => a.id !== activityId)
      };
    });

  } catch (err) {
    console.error("Kunde inte radera:", err);
  }
};

const handleDeleteDeal = async () => {
  if (!editingDealId) return;

  try {
    // 1. Identifiera vilket konto dealen tillhör innan vi tar bort den
    // Vi kollar först i selectedAccount, annars i newDeal
    const accountId = selectedAccount ? selectedAccount.id : newDeal.account;

    if (!accountId) {
      alert("Kunde inte identifiera vilket konto affären tillhör.");
      return;
    }

    await axios.delete(
      `${API_BASE_URL}/api/deals/${editingDealId}/`, 
      { headers: { Authorization: `Token ${localStorage.getItem('token')}` } }
    );

    // 2. Uppdatera selectedAccount lokalt (OM det är det kontot som är öppet)
    if (selectedAccount && selectedAccount.id === accountId) {
      const updatedSelectedDeals = selectedAccount.deals.filter(d => d.id !== editingDealId);
      setSelectedAccount({ ...selectedAccount, deals: updatedSelectedDeals });
    }

    // 3. Uppdatera den globala accounts-listan (VIKTIGT för Pipeline-vyn)
    setAccounts(prevAccounts => prevAccounts.map(acc => {
      if (acc.id === accountId) {
        return { 
          ...acc, 
          deals: (acc.deals || []).filter(d => d.id !== editingDealId) 
        };
      }
      return acc;
    }));

    // 4. Stäng modalen och nollställ
    setShowDealModal(false);
    setEditingDealId(null);
    setNewDeal({ name: '', value: '', stage: phases[0]?.id || '' });

  } catch (err) {
    console.error("Kunde inte ta bort affären:", err);
    alert("Det gick inte att ta bort affären. Prova igen.");
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault()
    // Hitta standardfasen om ingen är vald
    const defaultPhase = phases.find(p => p.is_default);
    
    const payload = {
      name: newName,
      phase: defaultPhase ? defaultPhase.id : null
    };

    if (!newName) return
    try {
      await axios.post(`${API_BASE_URL}/api/accounts/`, payload)
      setNewName('')
      fetchAccounts()
    } catch (err) {
      console.error("Kunde inte spara konton:", err)
    }
  }

  // Radera företag
  const deleteAccount = async (id) => {
    if (!window.confirm("Vill du verkligen ta bort detta konto?")) return
    try {
      await axios.delete(`${API_BASE_URL}/api/accounts/${id}/`)
      fetchAccounts()
    } catch (err) {
      console.error("Kunde inte radera:", err)
    }
  }


  // Skapa ny kontakt - uppdaterad för ContactForm
const handleAddContact = async (contactData) => {
  try {
    await axios.post(`${API_BASE_URL}/api/contacts/`, {
      ...contactData,           // Datan från ContactForm.jsx
      account: selectedAccount.id // Ditt valda konto-ID
    });

    // Istället för att tömma statet här (det sköts i ContactForm),
    // så hämtar vi bara den uppdaterade listan.
    fetchContacts(selectedAccount.id);
    
    console.log("Kontakt skapad!");
  } catch (err) {
    // Bra att logga err.response?.data för att se Postgres-valideringsfel
    console.error("Kunde inte spara kontakt:", err.response?.data || err);
  }
};

  const filteredAccounts = accounts.filter(acc => {
    const matchesSearch = acc.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
    
    // Vi jämför nu med ID:t
    //return matchesSearch && acc.phase === phaseFilter;
  })
  .sort((a, b) => {
    // localeCompare('sv') ser till att Å, Ä, Ö hamnar rätt
    return (a.name || "").localeCompare((b.name || ""), 'sv');
  });
  

 // Vi lägger till en kontroll: Om selectedAccount är null, ge oss en tom lista direkt.
  const sortedActivities = selectedAccount 
    ? activities
        .filter(a => Number(a.account) === Number(selectedAccount.id))
        .sort((a, b) => new Date(b.date) - new Date(a.date))
    : []; // Om inget konto är valt, returnera en tom array

    const handleUpdateAccount = async () => {
      try {
        // 1. Skicka uppdateringen till backend
        const res = await axios.put(`${API_BASE_URL}/api/accounts/${editAccount.id}/`, editAccount);
        
        // 2. VIKTIGT: Backend svarar nu med det kompletta objektet inkl. phase_details
        const updatedAccount = res.data;

        // 3. Uppdatera listan så att den visar rätt fas direkt
        setAccounts(prevAccounts => 
          prevAccounts.map(acc => acc.id === updatedAccount.id ? updatedAccount : acc)
        );

        // 4. Uppdatera det valda kontot (det du ser i detaljvyn)
        setSelectedAccount(updatedAccount);

        // 5. Stäng redigeringsläget
        setIsEditing(false);
        
        console.log("Uppdatering lyckades:", updatedAccount);
      } catch (err) {
        console.error("Kunde inte uppdatera konto:", err);
        alert("Något gick fel vid sparning.");
      }
    };

    const handleUpdateContact = async () => {
      try {
        const dataToSend = {
          // Vi tar account-ID från den ursprungliga kontakten
          account: selectedContact.account, 
          first_name: editContactData.first_name,
          last_name: editContactData.last_name,
          email: editContactData.email,
          phone: editContactData.phone,
          role: editContactData.role,
          is_active: editContactData.is_active ?? true // Postgres gillar explicita booleans
        };

        const res = await axios.put(
          `${API_BASE_URL}/api/contacts/${selectedContact.id}/`, 
          dataToSend
        );

        // Uppdatera listan och stäng modalen
        setContacts(contacts.map(c => c.id === selectedContact.id ? res.data : c));
        setSelectedContact(null);
        setIsEditingContact(false);
        
        console.log("Uppdatering lyckades!");
      } catch (err) {
        // Om det fortfarande blir 400, kolla här:
        console.error("Djangos felmeddelande:", err.response?.data);
      }
    };

    const deleteContact = async (contactId) => {
      if (!window.confirm("Vill du inaktivera denna kontakt? Den kommer inte synas i listan men historiken sparas.")) {
        return;
      }

      try {
        const res = await axios.patch(`${API_BASE_URL}/api/contacts/${contactId}/`, { 
          is_active: false 
        });
        
        // ÄNDRING HÄR: 
        // Istället för .filter (ta bort), använd .map (uppdatera)
        setContacts(prevContacts => 
          prevContacts.map(c => c.id === contactId ? res.data : c)
        );
        
        setSelectedContact(null); // Stäng modalen
      } catch (err) {
        console.error("Kunde inte inaktivera kontakten:", err);
      }
    };

    const handleUpdateStatus = async (contactId, newStatus) => {
      try {
        const res = await axios.patch(`${API_BASE_URL}/api/contacts/${contactId}/`, { 
          is_active: newStatus 
        });
        
        // ANVÄND PREV-STATE HÄR:
        setContacts(prevContacts => 
          prevContacts.map(c => c.id === contactId ? res.data : c)
        );
        
        // Viktigt: Uppdatera även den valda kontakten så modalen vet att den ändrats
        setSelectedContact(res.data);
        
        if (!newStatus) {
          // Om vi inaktiverar, stäng modalen så man ser listan uppdateras
          setSelectedContact(null);
        }
      } catch (err) {
        console.error("Fel vid statusuppdatering:", err);
      }
    };

    const handleSelectContact = (contact) => {
      setSelectedContact(contact);
      
      // Här "tankar" vi redigerings-datat med info från kontakten
      // Vi använder de nya fältnamnen (understreck) för Postgres
      setEditContactData({
        first_name: contact.first_name || '',
        last_name: contact.last_name || '',
        email: contact.email || '',
        phone: contact.phone || '',
        role: contact.role || ''
      });

      //setIsEditingContact(true);
    };

    //console.log("DEBUG - contacts:", contacts);

  // --- RENDERING ---
return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 md:p-8 flex justify-center font-sans transition-colors">
      <div className="w-full max-w-6xl">
        
        {/* --- LOGOTYP-SEKTION --- */}
        {/* --- TOP BAR: Logga, Nav och Inställningar på samma rad --- */}
        <div className="relative flex items-center justify-between mb-12">
          
          {/* 1. Logotyp (Vänster) */}
          <div className="flex-shrink-0">
            <img 
              src={logo} 
              alt="Logotyp" 
              className="h-10 w-auto object-contain cursor-pointer hover:opacity-80 transition-opacity" 
              onClick={() => {
                setSelectedAccount(null);
                setView('dashboard');
              }}
            />
          </div>

          {/* 2. Navigering (Centrerad) */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-1 rounded-2xl shadow-sm flex gap-1">
              <button
                onClick={() => {
                  setView('dashboard');
                  setSelectedAccount(null);
                  setEditingDealId(null); // Nollställer valt deal-ID
                  setNewDeal({ name: '', value: '', stage: phases[0]?.id || '' }); // Rensar deal-datan
                }}
                className={`px-8 py-2 rounded-xl text-sm font-bold transition-all ${
                  view === 'dashboard' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                Konton
              </button>
              {/* NY TABB */}
              <button
                onClick={() => {
                  setView('pipeline');
                  setSelectedAccount(null);
                  setEditingDealId(null); // Nollställer valt deal-ID
                  setNewDeal({ name: '', value: '', stage: phases[0]?.id || '' }); // Rensar deal-datan
                }}
                className={`px-8 py-2 rounded-xl text-sm font-bold transition-all ${
                  view === 'pipeline' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                Affärer
              </button>
              <button
                onClick={() => {
                  setView('people');
                  setSelectedAccount(null);
                  setEditingDealId(null); // Nollställer valt deal-ID
                  setNewDeal({ name: '', value: '', stage: phases[0]?.id || '' }); // Rensar deal-datan
                }}
                className={`px-8 py-2 rounded-xl text-sm font-bold transition-all ${
                  view === 'people' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                Personer
              </button>
            </div>
          </div>

          {/* 3. Inställningar + Theme toggle (Höger) */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <button
              onClick={() => { setView('settings'); setSelectedAccount(null); }}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                view === 'settings'
                  ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-100 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300'
              }`}
            >
              <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">Inställningar</span>
              <SettingsIcon className="h-5 w-5" />
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300 transition-all"
              title={theme === 'dark' ? 'Byt till ljust läge' : 'Byt till mörkt läge'}
            >
              {theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)
                ? <IconSun className="h-5 w-5" />
                : <IconMoon className="h-5 w-5" />
              }
            </button>
          </div>

        </div>

        {/* --- VILLKORLIG RENDERING AV VYER --- */}
        {/* VY 1: INSTÄLLNINGAR */}
        {view === 'settings' && <Settings />}

        {/* VY 2: PIPELINE */}
        {view === 'pipeline' && (
          <PipelineView 
            phases={phases} 
            accounts={accounts} 
            onEditDeal={openEditDealModal} 
            onUpdateDealPhase={handleUpdateDealPhase} // VIKTIG: Denna rad måste med!
          />
        )}

        {/* VY 3: PERSONER */}
        {view === 'people' && (
        <PeopleView 
          people={contacts} 
          onContactClick={handleSelectContact} 
          onAccountClick={(accountId) => {
            const account = accounts.find(acc => Number(acc.id) === Number(accountId));
            
            if (account) {
              console.log("Sätter selectedAccount till:", account.name);
              
              // 1. Sätt kontot först
              setSelectedAccount(account);
              
              // 2. Om du har setSelectedAccountId (för sidomenyn), sätt det också
              if (typeof setSelectedAccountId === 'function') {
                setSelectedAccountId(account.id);
              }

              // 3. Byt vy sist
              setView('dashboard');
            } else {
              console.warn("Kunde inte hitta konto med ID:", accountId);
            }
          }}
        />
      )}

        {/* VY 4: DASHBOARD (FÖRETAG) */}
        {view === 'dashboard' && (
        
          <> {/* Start Dashboard Fragment */}
            {!selectedAccount ? (
              /* ================= VY 1: HUVUDLISTA ================= */
              <div className="max-w-2xl mx-auto">
  
                {/* Header med rubrik och antal */}
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Mina konton</h1>

                  {/* Antals-badge som matchar PeopleView */}
                  <span className="text-sm text-gray-500 dark:text-gray-400 font-medium bg-white dark:bg-gray-800 px-4 py-1.5 rounded-full shadow-sm border border-gray-100 dark:border-gray-700">
                    {filteredAccounts.length} {filteredAccounts.length === 1 ? 'konto' : 'konton'}
                  </span>
                </div>

                <div className="mb-6">
                  <input
                    type="text"
                    placeholder="Sök bland konton..."
                    className="w-full pl-4 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
                  <form onSubmit={handleSubmit} className="flex gap-4">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Nytt konto..."
                      className="flex-1 border border-gray-300 dark:border-gray-600 rounded px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                    />
                    <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700 transition">
                      Spara
                    </button>
                  </form>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredAccounts.map((acc) => {
                      const dealCount = acc.deals ? acc.deals.length : 0;

                      return (
                        <li key={acc.id} className="px-6 py-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-all group">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="flex items-center gap-3"> {/* Rad för namn och badge */}
                              <span
                                className="font-bold text-gray-900 dark:text-gray-100 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors"
                                onClick={() => {
                                  setSelectedAccount(acc);
                                  fetchContacts(acc.id);
                                  fetchActivities(acc.id);
                                }}
                              >
                                {acc.name}
                              </span>

                              {/* Badge direkt efter namnet */}
                              {dealCount > 0 && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                  {dealCount} {dealCount === 1 ? 'affär' : 'affärer'}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center">
                            <button
                              onClick={() => deleteAccount(acc.id)}
                              className="p-2 text-gray-300 dark:text-gray-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                              title="Ta bort konto"
                            >
                              <IconTrash className="w-5 h-5" />
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            ) : (
              /* ================= VY 2: DETALJVY ================= */
              <div>
                <button onClick={() => setSelectedAccount(null)} className="text-gray-600 dark:text-gray-400 mb-6 hover:text-black dark:hover:text-white flex items-center gap-1 font-medium">
                  ← Tillbaka
                </button>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8 border-t-8 border-blue-600">
                  {/* Header-sektion */}
                  <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center gap-4">
                      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
                        {selectedAccount.name}
                      </h1>
                      <span className="text-sm text-gray-400 dark:text-gray-500 font-medium bg-gray-50 dark:bg-gray-700 px-3 py-1 rounded-full border border-gray-100 dark:border-gray-600 mt-1">
                        Skapat {selectedAccount.created_at ? new Date(selectedAccount.created_at).toLocaleDateString('sv-SE') : 'Okänt datum'}
                      </span>
                    </div>

                    {!isEditing ? (
                      <button 
                        onClick={() => {
                          setIsEditing(true);
                          setEditAccount(selectedAccount);
                        }}
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-bold text-sm transition-all shadow-sm"
                      >
                        ✎ Redigera info
                      </button>
                    ) : (
                      <div className="flex gap-3">
                        <button 
                          onClick={handleUpdateAccount} 
                          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-md transition-colors"
                        >
                          Spara ändringar
                        </button>
                        <button 
                          onClick={() => setIsEditing(false)} 
                          className="bg-white border border-gray-300 text-gray-600 px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                        >
                          Avbryt
                        </button>
                      </div>
                    )}
                  </div>

                  {!isEditing ? (
                    /* VISNINGSLÄGE - Nu med 2 bredare kolumner */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-16">
                      
                      {/* Vänster kolumn: Plats & Bransch */}
                      <div className="space-y-6">
                        <div>
                          <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Adress</label>
                          <div className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                            <span className="text-xl">📍</span>
                            <div className="leading-relaxed text-lg">
                              {selectedAccount.address ? (
                                selectedAccount.address.split(',').map((line, i) => (
                                  <div key={i} className={i === 0 ? "font-medium text-gray-900 dark:text-gray-100" : ""}>{line.trim()}</div>
                                ))
                              ) : (
                                <span className="text-gray-400 dark:text-gray-500 italic">Ingen adress angiven</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Bransch</label>
                          <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                            <span className="text-xl">🏢</span>
                            <span className="text-lg">{selectedAccount.industry || <span className="text-gray-400 dark:text-gray-500 italic">Ej angivet</span>}</span>
                          </div>
                        </div>
                      </div>

                      {/* Höger kolumn: Kontaktuppgifter */}
                      <div className="space-y-6">
                        <div>
                          <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Telefonnummer</label>
                          <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                            <span className="text-xl">📞</span>
                            <span className="text-lg">
                              {selectedAccount.phone ? (
                                <a href={`tel:${selectedAccount.phone}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{selectedAccount.phone}</a>
                              ) : (
                                <span className="text-gray-400 dark:text-gray-500 italic">Inget nummer</span>
                              )}
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Webbplats</label>
                          <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                            <span className="text-xl">🌐</span>
                            <span className="text-lg">
                              {selectedAccount.website ? (
                                <a href={selectedAccount.website} target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                                  {selectedAccount.website.replace(/^https?:\/\//, '')}
                                </a>
                              ) : (
                                <span className="text-gray-400 dark:text-gray-500 italic">Ingen webbplats</span>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* REDIGERINGSLÄGE */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-50 dark:bg-gray-700 p-6 rounded-xl border border-dashed border-gray-300 dark:border-gray-600">
                      <div className="space-y-5">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">Adress (Använd komma för radbrytning)</label>
                          <input 
                            className="w-full border-gray-300 border p-3 rounded-lg text-base focus:ring-2 focus:ring-blue-500 outline-none shadow-sm" 
                            value={editAccount.address || ''} 
                            onChange={e => setEditAccount({...editAccount, address: e.target.value})} 
                            placeholder="Ex: Storgatan 1, 123 45 Stockholm" 
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">Bransch</label>
                          <input 
                            className="w-full border-gray-300 border p-3 rounded-lg text-base focus:ring-2 focus:ring-blue-500 outline-none shadow-sm" 
                            value={editAccount.industry || ''} 
                            onChange={e => setEditAccount({...editAccount, industry: e.target.value})} 
                            placeholder="T.ex. Fastigheter eller IT" 
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-5">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">Telefon</label>
                          <input 
                            className="w-full border-gray-300 border p-3 rounded-lg text-base focus:ring-2 focus:ring-blue-500 outline-none shadow-sm" 
                            value={editAccount.phone || ''} 
                            onChange={e => setEditAccount({...editAccount, phone: e.target.value})} 
                            placeholder="08-123 456 00" 
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">Webbplats</label>
                          <input 
                            className="w-full border-gray-300 border p-3 rounded-lg text-base focus:ring-2 focus:ring-blue-500 outline-none shadow-sm" 
                            value={editAccount.website || ''} 
                            onChange={e => setEditAccount({...editAccount, website: e.target.value})} 
                            placeholder="https://www.foretaget.se" 
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Flik-navigering */}
                <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-700 mb-6 bg-gray-50/50 dark:bg-gray-800/50 p-1 rounded-t-lg">
                  
                  {/* NY TABB: Affärer (Deals) */}
                  <button
                    onClick={() => setActiveTab('deals')}
                    className={`flex items-center gap-2 py-2.5 px-5 rounded-lg font-medium text-sm transition-all duration-200 ${
                      activeTab === 'deals'
                      ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm border border-gray-200 dark:border-gray-600 ring-1 ring-black/5'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    <DollarSign size={18} color={activeTab === 'deals' ? "#2563eb" : "#6b7280"} />
                    <span>Affärer</span>
                    <span className={`ml-1 text-xs px-2 py-0.5 rounded-full ${activeTab === 'deals' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'}`}>
                      {selectedAccount.deals?.length || 0}
                    </span>
                  </button>

                  {/* Befintlig: Kontakter */}
                  <button
                    onClick={() => setActiveTab('contacts')}
                    className={`flex items-center gap-2 py-2.5 px-5 rounded-lg font-medium text-sm transition-all duration-200 ${
                      activeTab === 'contacts'
                      ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm border border-gray-200 dark:border-gray-600 ring-1 ring-black/5'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    <CRMIcon size={18} color={activeTab === 'contacts' ? "#2563eb" : "#6b7280"} />
                    <span>Kontakter</span>
                    <span className={`ml-1 text-xs px-2 py-0.5 rounded-full ${activeTab === 'contacts' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'}`}>
                      {contacts.length}
                    </span>
                  </button>

                  {/* Befintlig: Aktivitetslogg */}
                  <button
                    onClick={() => setActiveTab('activities')}
                    className={`flex items-center gap-2 py-2.5 px-5 rounded-lg font-medium text-sm transition-all duration-200 ${
                      activeTab === 'activities'
                      ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm border border-gray-200 dark:border-gray-600 ring-1 ring-black/5'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    <ActivityIcon size={18} color={activeTab === 'activities' ? "#2563eb" : "#6b7280"} />
                    <span>Aktivitetslogg</span>
                    <span className={`ml-1 text-xs px-2 py-0.5 rounded-full ${activeTab === 'activities' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'}`}>
                      {activities.length}
                    </span>
                  </button>
                </div>

                {/* Flik-innehåll */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                  {activeTab === 'contacts' && (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                      {/* Vänster: Lista */}
                      <div className="md:col-span-7">
                        <h2 className="text-xl font-bold mb-4 text-gray-700 dark:text-gray-200">Kontaktpersoner</h2>
                        <ContactList 
                          contacts={contacts} 
                          onContactClick={handleSelectContact} 
                          onUpdateStatus={handleUpdateStatus} 
                        />
                      </div>
                      {/* Höger: Formulär */}
                      <div className="md:col-span-5 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-100 dark:border-gray-600">
                        <h3 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">Ny kontakt</h3>
                        <ContactForm onAddContact={handleAddContact} />
                      </div>
                    </div>
                  )}

                  {activeTab === 'activities' && (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                      {/* Vänster: Lista */}
                      <div className="md:col-span-7">
                        <h2 className="text-xl font-bold mb-4 text-gray-700 dark:text-gray-200">Aktivitetslogg</h2>
                        <ActivityLog 
                          activities={activities} 
                          onDeleteActivity={deleteActivity} 
                          onEditActivity={openEditActivityModal} 
                        />
                      </div>
                      {/* Höger: Formulär */}
                      <div className="md:col-span-5 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-100 dark:border-gray-600">
                        <h3 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">Logga aktivitet</h3>
                        <ActivityForm onAddActivity={addActivity} contacts={contacts} />
                      </div>
                    </div>
                  )}

                  {activeTab === 'deals' && (
                    <Deals 
                      selectedAccount={selectedAccount} 
                      dealPhases={phases} 
                      onAddDeal={handleOpenNewDealModal}
                      onEditDeal={openEditDealModal}    // Ny funktion för redigering
                    />
                  )}
                </div>
              </div> /* Slut Vy 2 */
            )}

            <ContactModal 
              contact={selectedContact}
              activities={activities}
              onClose={() => { setSelectedContact(null); setIsEditingContact(false); }}
              isEditing={isEditingContact}
              setIsEditing={setIsEditingContact}
              editData={editContactData}
              setEditData={setEditContactData}
              onUpdate={handleUpdateContact}
              onDelete={deleteContact}
              onUpdateStatus={handleUpdateStatus}
              onDeleteActivity={deleteActivity}
            />  
          </> /* Slut Dashboard Fragment */
        )}

      </div> 
        <ContactModal 
              contact={selectedContact}
              activities={activities}
              onClose={() => { setSelectedContact(null); setIsEditingContact(false); }}
              isEditing={isEditingContact}
              setIsEditing={setIsEditingContact}
              editData={editContactData}
              setEditData={setEditContactData}
              onUpdate={handleUpdateContact}
              onDelete={deleteContact}
              onUpdateStatus={handleUpdateStatus}
              onDeleteActivity={deleteActivity}
            />


            {showDealModal && (
            <DealModal 
              isOpen={showDealModal}
              onClose={() => setShowDealModal(false)}
              onSave={handleSaveDeal} // Denna funktion skapade vi i förra steget
              onDelete={handleDeleteDeal}
              dealData={newDeal}
              setDealData={setNewDeal}
              phases={phases}
              isEditing={!!editingDealId} // Gör om ID:t till en boolean (true om vi redigerar)
              contacts={contacts}
              onAddActivity={addActivity}
              onDeleteActivity={deleteActivity}
              onEditActivity={openEditActivityModal}
            />
          )}

          {showActivityEditModal && (
            <EditActivityModal
              isOpen={showActivityEditModal}
              activity={editingActivity}
              contacts={contacts}
              onClose={() => setShowActivityEditModal(false)}
              onSave={updateActivity}
            />
          )}
    </div> 
  );

  }

export default App;