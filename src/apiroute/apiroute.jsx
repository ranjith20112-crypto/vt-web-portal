// src/apiroute/apiroute.jsx
import axios from 'axios';

const API_BASE_URL = 'https://backend-r6xl.onrender.com'; // Change this to your backend URL in production

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
