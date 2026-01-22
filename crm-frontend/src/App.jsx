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
import Deals from './components/Deals';
import { IconCall, IconEmail, IconMeeting, IconNote, IconTrash, SettingsIcon, CRMIcon, ActivityIcon, DollarSign } from './components/Icons';
import API_BASE_URL from './api'; // Importera din nya konfiguration

function App() {
  // --- STATES ---
  const [isEditing, setIsEditing] = useState(false);
  const [editAccount, setEditAccount] = useState({});
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

const [showDealModal, setShowDealModal] = useState(false);
const [newDeal, setNewDeal] = useState({
  name: '',
  value: '',
  stage: phases[0]?.id || '' // Sätter första tillgängliga fas som förval
});


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

// --- HÄMTA DATA VID START OCH VID VY-BYTE ---
    useEffect(() => {
      // Nollställ val vid vy-byte
      setSelectedAccount(null);
      setSelectedContact(null); // Bra att nollställa även denna
      setIsEditing(false);

      // Hämta ALLTID kontakter så att PeopleView och listor fungerar
      fetchContacts(); 
      
      // Hämta konton och faser (behövs oftast i alla vyer)
      fetchAccounts();
      fetchPhases();

      // Om du vill vara specifik kan du behålla if-satser, 
      // men det är säkrast att ladda kontakter direkt:
      if (view === 'people') {
        fetchContacts();
      }
    }, [view]);

  // --- FUNKTIONER ---
  
  // Hämta alla företag
  const fetchAccounts = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/accounts/`);

      setAccounts(res.data)
    } catch (err) {
      console.error("Kunde inte hämta prospekt:", err)
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

  const addActivity = async (activityData) => {
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
};
  
const deleteActivity = async (activityId) => {
  if (!window.confirm("Vill du verkligen ta bort denna aktivitet permanent?")) {
    return;
  }

  try {
    await axios.delete(`${API_BASE_URL}/api/activities/${activityId}/`);
    
    // Uppdatera statet genom att filtrera bort den raderade aktiviteten
    setActivities(prev => prev.filter(a => a.id !== activityId));
  } catch (err) {
    console.error("Kunde inte radera aktiviteten:", err);
    alert("Ett fel uppstod när aktiviteten skulle raderas.");
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
      console.error("Kunde inte spara prospekt:", err)
    }
  }

  // Radera företag
  const deleteAccount = async (id) => {
    if (!window.confirm("Vill du verkligen ta bort detta prospekt?")) return
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

      // Öppna modalen!
      //setIsEditingContact(true);
    };

// I App.jsx
console.log("Faser i App.jsx:", phases);
console.log("Valt konto i App.jsx:", selectedAccount);
  // --- RENDERING ---
return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 flex justify-center font-sans">
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
            <div className="bg-white border border-gray-100 p-1 rounded-2xl shadow-sm flex gap-1">
              <button 
                onClick={() => { setView('dashboard'); setSelectedAccount(null); }}
                className={`px-8 py-2 rounded-xl text-sm font-bold transition-all ${
                  view === 'dashboard' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                Dashboard
              </button>
              <button 
                onClick={() => { setView('people'); setSelectedAccount(null); }}
                className={`px-8 py-2 rounded-xl text-sm font-bold transition-all ${
                  view === 'people' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                Personer
              </button>
            </div>
          </div>

          {/* 3. Inställningar (Höger) */}
          <div className="flex-shrink-0">
            <button 
              onClick={() => { setView('settings'); setSelectedAccount(null); }}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                view === 'settings' 
                  ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-100' 
                  : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
              }`}
            >
              <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">Inställningar</span>
              <SettingsIcon className="h-5 w-5" />
            </button>
          </div>

        </div>

        {/* --- VILLKORLIG RENDERING AV VYER --- */}
        {/* VY 1: INSTÄLLNINGAR */}
        {view === 'settings' && <Settings />}

        {/* VY 2: PERSONER */}
        {view === 'people' && (
          <PeopleView 
            people={contacts} 
            onContactClick={handleSelectContact} 
          />
        )}

        {/* VY 3: DASHBOARD (FÖRETAG) */}
        {view === 'dashboard' && (
        
          <> {/* Start Dashboard Fragment */}
            {!selectedAccount ? (
              /* ================= VY 1: HUVUDLISTA ================= */
              <div className="max-w-2xl mx-auto">
  
                {/* Header med rubrik och antal */}
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-3xl font-bold text-gray-800">Mina prospekt</h1>
                  
                  {/* Antals-badge som matchar PeopleView */}
                  <span className="text-sm text-gray-500 font-medium bg-white px-4 py-1.5 rounded-full shadow-sm border border-gray-100">
                    {filteredAccounts.length} {filteredAccounts.length === 1 ? 'företag' : 'företag'}
                  </span>
                </div>

                <div className="mb-6">
                  <input 
                    type="text"
                    placeholder="Sök bland prospekt..."
                    className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Ta bort fasknapparna */}
                {/* <div className="flex flex-wrap gap-2 mb-6"> */}
                  {/* "Alla"-knappen finns alltid kvar */}
                  {/* <button
                    onClick={() => setPhaseFilter('all')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      phaseFilter === 'all' 
                        ? 'bg-gray-900 text-white shadow-lg' 
                        : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'
                    }`}
                  >
                    Alla
                  </button> */}

                  {/* Dynamiska knappar från dina inställningar */}
                 {/*  {phases.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPhaseFilter(p.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border`}
                      style={{
                        backgroundColor: phaseFilter === p.id ? p.color : 'white',
                        color: phaseFilter === p.id ? 'white' : '#6b7280',
                        borderColor: phaseFilter === p.id ? p.color : '#f3f4f6',
                        boxShadow: phaseFilter === p.id ? `0 4px 12px ${p.color}44` : 'none'
                      }}
                    >
                      {p.name}
                    </button>
                  ))}
                
                </div> */}

                <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                  <form onSubmit={handleSubmit} className="flex gap-4">
                    <input 
                      type="text"
                      value={newName} 
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Nytt prospekt..."
                      className="flex-1 border border-gray-300 rounded px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700 transition">
                      Spara
                    </button>
                  </form>
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <ul className="divide-y divide-gray-200">
                    {filteredAccounts.map((acc) => (
                      <li key={acc.id} className="px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition">
                        <div className="flex items-center gap-4 flex-1">
                          <span 
                            className="font-medium text-blue-600 cursor-pointer hover:underline"
                            onClick={() => {
                              setSelectedAccount(acc);
                              fetchContacts(acc.id);
                              fetchActivities(acc.id);
                            }}
                          >
                            {acc.name}
                          </span>
                          
                          {/* FAS-ETIKETT DYNAMISK */}
                          {/*{acc.phase_details ? (
                            <span 
                              className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white"
                              style={{ backgroundColor: acc.phase_details.color || '#gray-400' }}
                            >
                              {acc.phase_details.name}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-400">
                              Ingen fas
                            </span>
                          )}*/}

                        </div>

                        <button 
                          onClick={() => deleteAccount(acc.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          title="Ta bort företag"
                        >
                          <IconTrash className="w-5 h-5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              /* ================= VY 2: DETALJVY ================= */
              <div>
                <button onClick={() => setSelectedAccount(null)} className="text-gray-600 mb-6 hover:text-black flex items-center gap-1 font-medium">
                  ← Tillbaka till listan
                </button>
                
                <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border-t-8 border-blue-600">
                  {/* Header-sektion */}
                  <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center gap-4">
                      <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                        {selectedAccount.name}
                      </h1>
                      <span className="text-sm text-gray-400 font-medium bg-gray-50 px-3 py-1 rounded-full border border-gray-100 mt-1">
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
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Adress</label>
                          <div className="flex items-start gap-3 text-gray-700">
                            <span className="text-xl">📍</span>
                            <div className="leading-relaxed text-lg">
                              {selectedAccount.address ? (
                                selectedAccount.address.split(',').map((line, i) => (
                                  <div key={i} className={i === 0 ? "font-medium text-gray-900" : ""}>{line.trim()}</div>
                                ))
                              ) : (
                                <span className="text-gray-400 italic">Ingen adress angiven</span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Bransch</label>
                          <div className="flex items-center gap-3 text-gray-700">
                            <span className="text-xl">🏢</span>
                            <span className="text-lg">{selectedAccount.industry || <span className="text-gray-400 italic">Ej angivet</span>}</span>
                          </div>
                        </div>
                      </div>

                      {/* Höger kolumn: Kontaktuppgifter */}
                      <div className="space-y-6">
                        <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Telefonnummer</label>
                          <div className="flex items-center gap-3 text-gray-700">
                            <span className="text-xl">📞</span>
                            <span className="text-lg">
                              {selectedAccount.phone ? (
                                <a href={`tel:${selectedAccount.phone}`} className="hover:text-blue-600 transition-colors">{selectedAccount.phone}</a>
                              ) : (
                                <span className="text-gray-400 italic">Inget nummer</span>
                              )}
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Webbplats</label>
                          <div className="flex items-center gap-3 text-gray-700">
                            <span className="text-xl">🌐</span>
                            <span className="text-lg">
                              {selectedAccount.website ? (
                                <a href={selectedAccount.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-medium">
                                  {selectedAccount.website.replace(/^https?:\/\//, '')}
                                </a>
                              ) : (
                                <span className="text-gray-400 italic">Ingen webbplats</span>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* REDIGERINGSLÄGE */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-50 p-6 rounded-xl border border-dashed border-gray-300">
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
                <div className="flex space-x-2 border-b border-gray-200 mb-6 bg-gray-50/50 p-1 rounded-t-lg">
                  
                  {/* NY TABB: Affärer (Deals) */}
                  <button
                    onClick={() => setActiveTab('deals')}
                    className={`flex items-center gap-2 py-2.5 px-5 rounded-lg font-medium text-sm transition-all duration-200 ${
                      activeTab === 'deals' 
                      ? 'bg-white text-blue-600 shadow-sm border border-gray-200 ring-1 ring-black/5' 
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                    }`}
                  >
                    {/* Byt ut DollarSign mot den ikon du har importerat, t.ex. Briefcase eller TrendingUp */}
                    <DollarSign size={18} color={activeTab === 'deals' ? "#2563eb" : "#6b7280"} />
                    <span>Affärer</span>
                    <span className={`ml-1 text-xs px-2 py-0.5 rounded-full ${activeTab === 'deals' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'}`}>
                      {selectedAccount.deals?.length || 0}
                    </span>
                  </button>

                  {/* Befintlig: Kontakter */}
                  <button
                    onClick={() => setActiveTab('contacts')}
                    className={`flex items-center gap-2 py-2.5 px-5 rounded-lg font-medium text-sm transition-all duration-200 ${
                      activeTab === 'contacts' 
                      ? 'bg-white text-blue-600 shadow-sm border border-gray-200 ring-1 ring-black/5' 
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                    }`}
                  >
                    <CRMIcon size={18} color={activeTab === 'contacts' ? "#2563eb" : "#6b7280"} />
                    <span>Kontakter</span>
                    <span className={`ml-1 text-xs px-2 py-0.5 rounded-full ${activeTab === 'contacts' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'}`}>
                      {contacts.length}
                    </span>
                  </button>

                  {/* Befintlig: Aktivitetslogg */}
                  <button
                    onClick={() => setActiveTab('activities')}
                    className={`flex items-center gap-2 py-2.5 px-5 rounded-lg font-medium text-sm transition-all duration-200 ${
                      activeTab === 'activities' 
                      ? 'bg-white text-blue-600 shadow-sm border border-gray-200 ring-1 ring-black/5' 
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                    }`}
                  >
                    <ActivityIcon size={18} color={activeTab === 'activities' ? "#2563eb" : "#6b7280"} />
                    <span>Aktivitetslogg</span>
                    <span className={`ml-1 text-xs px-2 py-0.5 rounded-full ${activeTab === 'activities' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'}`}>
                      {activities.length}
                    </span>
                  </button>
                </div>

                {/* Flik-innehåll */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  {activeTab === 'contacts' && (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                      {/* Vänster: Lista */}
                      <div className="md:col-span-7">
                        <h2 className="text-xl font-bold mb-4 text-gray-700">Kontaktpersoner</h2>
                        <ContactList 
                          contacts={contacts} 
                          onContactClick={handleSelectContact} 
                          onUpdateStatus={handleUpdateStatus} 
                        />
                      </div>
                      {/* Höger: Formulär */}
                      <div className="md:col-span-5 bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <h3 className="font-semibold mb-3">Ny kontakt</h3>
                        <ContactForm onAddContact={handleAddContact} />
                      </div>
                    </div>
                  )}

                  {activeTab === 'activities' && (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                      {/* Vänster: Lista */}
                      <div className="md:col-span-7">
                        <h2 className="text-xl font-bold mb-4 text-gray-700">Aktivitetslogg</h2>
                        <ActivityLog activities={activities} onDeleteActivity={deleteActivity} />
                      </div>
                      {/* Höger: Formulär */}
                      <div className="md:col-span-5 bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <h3 className="font-semibold mb-3">Logga aktivitet</h3>
                        <ActivityForm onAddActivity={addActivity} contacts={contacts} />
                      </div>
                    </div>
                  )}

                  {activeTab === 'deals' && (
                    <Deals 
                      selectedAccount={selectedAccount} 
                      dealPhases={phases} 
                      onAddDeal={() => setShowDealModal(true)} // Skicka med funktionen som prop
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
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900">Skapa ny affärsmöjlighet</h2>
                  <p className="text-sm text-gray-500">Lägg till detaljer för den nya affären på {selectedAccount.name}</p>
                </div>
                
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Affärens namn</label>
                    <input 
                      type="text"
                      className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="t.ex. Årslicens 2024"
                      value={newDeal.name}
                      onChange={e => setNewDeal({...newDeal, name: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Värde (SEK)</label>
                      <input 
                        type="number"
                        className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="0"
                        value={newDeal.value}
                        onChange={e => setNewDeal({...newDeal, value: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Fas</label>
                      <select 
                        className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                        value={newDeal.stage}
                        onChange={e => setNewDeal({...newDeal, stage: e.target.value})}
                      >
                        {phases.map(phase => (
                          <option key={phase.id} value={phase.id}>{phase.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-gray-50 flex gap-3">
                  <button 
                    onClick={handleCreateDeal}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-blue-200"
                  >
                    Spara affär
                  </button>
                  <button 
                    onClick={() => setShowDealModal(false)}
                    className="flex-1 bg-white border border-gray-200 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    Avbryt
                  </button>
                </div>
              </div>
            </div>
          )}
    </div> 
  );

  }

export default App;