import React, { useState } from 'react';

const ContactForm = ({ onAddContact }) => {
  const initialFormState = {
    first_name: '',
    last_name: '',
    role: '',
    phone: '',
    email: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Skicka datan uppåt till App.jsx
    onAddContact(formData);
    // Töm formuläret efteråt
    setFormData(initialFormState);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 mb-6">
      <div className="grid grid-cols-2 gap-2">
        <input 
          placeholder="Förnamn" 
          className="border p-2 rounded" 
          value={formData.first_name} 
          onChange={e => setFormData({...formData, first_name: e.target.value})} 
          required
        />
        <input 
          placeholder="Efternamn" 
          className="border p-2 rounded" 
          value={formData.last_name} 
          onChange={e => setFormData({...formData, last_name: e.target.value})} 
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input 
          placeholder="Roll" 
          className="border p-2 rounded" 
          value={formData.role} 
          onChange={e => setFormData({...formData, role: e.target.value})} 
        />
        <input 
          placeholder="Telefon" 
          className="border p-2 rounded" 
          value={formData.phone} 
          onChange={e => setFormData({...formData, phone: e.target.value})} 
        />
      </div>
      <input 
        type="email" 
        placeholder="E-post" 
        className="w-full border p-2 rounded" 
        value={formData.email} 
        onChange={e => setFormData({...formData, email: e.target.value})} 
        required
      />
      <button className="w-full bg-blue-600 text-white p-2 rounded font-bold hover:bg-blue-700 transition-colors">
        Spara kontakt
      </button>
    </form>
  );
};

export default ContactForm;