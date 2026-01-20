// src/api.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

console.log("Min API-URL är just nu:", API_BASE_URL); // Detta kommer synas i Inspektera -> Console

export default API_BASE_URL;