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

    const errorMessage =
      errorData.message ||
      errorData.title ||
      (errorData.errors ? Object.values(errorData.errors).flat().join(' ') : null) ||
      `Error ${response.status}: No se pudo completar la solicitud`;

    throw new Error(errorMessage);
  }

  if (response.status === 204) return null;

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


export const getUsers = () => customFetch('/Users');

export const updateUser = (id, userData) =>
  customFetch(`/Users/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      phoneNumber: userData.phoneNumber || "No especificado",
      role: userData.role
    }),
  });

export const deleteUser = (id) =>
  customFetch(`/Users/${id}`, {
    method: 'DELETE',
  });


export const getEvents = () => customFetch('/Events');
export const getTickets = () => customFetch('/Events');
export const getEventById = (id) => customFetch(`/Events/${id}`);
export const getTicketTypesByEvent = (eventId) => customFetch(`/Events/${eventId}/tickets`);

export const createEvent = (eventData) =>
  customFetch('/Events', {
    method: 'POST',
    body: JSON.stringify(eventData),
  });

export const updateEvent = (id, eventData) =>
  customFetch(`/Events/${id}`, {
    method: 'PUT',
    body: JSON.stringify(eventData),
  });

export const deleteEvent = (id) =>
  customFetch(`/Events/${id}`, {
    method: 'DELETE',
  });


export const createOrder = (orderData) =>
  customFetch('/Orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
  });

export const createPaymentPreference = (orderData) =>
  customFetch('/Orders/create-preference', {
    method: 'POST',
    body: JSON.stringify(orderData),
  });

export const getMyOrders = () => customFetch('/Orders/my-orders');


export const approveOrder = (orderId) =>
  customFetch(`/Orders/approve/${orderId}`, {
    method: 'POST',
  });

export const testConnection = () => customFetch('/Users/test');

export default customFetch;