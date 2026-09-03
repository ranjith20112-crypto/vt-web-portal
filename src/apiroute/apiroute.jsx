// src/apiroute/apiroute.jsx
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api'; // Change this to your backend URL in production

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;