const API_URL = 'https://localhost:7030/api';

const customFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    // Captura clara de errores enviados por .NET
    const errorMessage =
      errorData.message ||
      errorData.title ||
      (errorData.errors ? Object.values(errorData.errors).flat().join(' ') : null) ||
      `Error ${response.status}: No se pudo completar la solicitud`;

    throw new Error(errorMessage);
  }

  // Respuesta HTTP 204 No Content
  if (response.status === 204) return null;

  // Manejo de respuesta seguro para JSON, texto o números sueltos
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return await response.json();
  }

  const text = await response.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
};

// --- AUTENTICACIÓN ---
export const login = async (credentials) => {
  const data = await customFetch('/Authentication/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });

  if (data?.token) {
    localStorage.setItem('token', data.token);
  }

  return data;
};

// --- USUARIOS ---
export const register = (userData) =>
  customFetch('/Users/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });

export const getMyProfile = () => customFetch('/Users/me');

export const updateMyProfile = (userData) =>
  customFetch('/Users/me', {
    method: 'PUT',
    body: JSON.stringify(userData),
  });

// --- EVENTOS / TICKETS ---
export const getEvents = () => customFetch('/Events');
export const getTickets = () => customFetch('/Events');

// Funciones para el proceso de Checkout
export const getEventById = (id) => customFetch(`/Events/${id}`);
export const getTicketTypesByEvent = (eventId) => customFetch(`/Events/${eventId}/tickets`);

// --- ÓRDENES ---
export const createOrder = (orderData) =>
  customFetch('/Orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
  });

// Integración con Mercado Pago: crea la orden en estado 'Pending' y genera la preferencia de pago
export const createPaymentPreference = (orderData) =>
  customFetch('/Orders/create-preference', {
    method: 'POST',
    body: JSON.stringify(orderData),
  });

export const getMyOrders = () => customFetch('/Orders/my-orders');

// --- TEST DE CONEXIÓN ---
export const testConnection = () => customFetch('/Users/test');

export default customFetch;