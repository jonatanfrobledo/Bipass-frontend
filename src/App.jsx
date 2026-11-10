import { useState } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import Login from "./components/login/Login";
import OrganizerDashboard from "./components/dashboard/Dashboard";
import Register from "./components/register/Register";
import Billboard from "./components/billboard/Billboard";
import AppNavbar from "./components/navbar/Navbar"; 
import Contact from "./components/contacts/Contact";
import MyTickets from "./components/myTickets/MyTickets";
import MyEvents from "./components/events/MyEvents";
import AdminEvents from "./components/admin/AdminEvents";
import Checkout from "./components/checkout/Checkout";
import { login as loginApi, register as registerApi } from './services/apiService';

const ProtectedRoute = ({ isAuthenticated, children }) => {
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('token');
  });

  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem('user_role') || '';
  });

  const navigate = useNavigate();

  const extractRoleFromToken = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const payload = JSON.parse(jsonPayload);
      return payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || payload["role"] || '';
    } catch (e) {
      return '';
    }
  };

  const handleLogin = async (credentials, redirectPath = '/billboard') => {
    try {
      const response = await loginApi(credentials);
      if (response && response.token) {
        localStorage.setItem('token', response.token);
        
        const role = response.role || extractRoleFromToken(response.token);
        localStorage.setItem('user_role', role);
        
        setUserRole(role);
        setIsAuthenticated(true);
        navigate(redirectPath);
      }
    } catch (error) {
      alert("Error al iniciar sesión: " + (error.message || "Credenciales inválidas"));
    }
  };

  const handleRegister = async (userData) => {
    try {
      await registerApi(userData);
      const loginResponse = await loginApi({ 
        email: userData.email, 
        password: userData.password 
      });

      if (loginResponse && loginResponse.token) {
        localStorage.setItem('token', loginResponse.token);
        const role = loginResponse.role || extractRoleFromToken(loginResponse.token);
        localStorage.setItem('user_role', role);

        setUserRole(role);
        setIsAuthenticated(true);
        navigate('/billboard');
      } else {
        navigate('/login');
      }
    } catch (error) {
      alert("Error en el registro: " + (error.message || "No se pudo registrar"));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_role');
    setIsAuthenticated(false);
    setUserRole('');
    navigate('/');
  };

  return (
    <>
      <AppNavbar isAuthenticated={isAuthenticated} userRole={userRole} onLogout={handleLogout} />

      <Routes>
        <Route path="/" element={<Billboard isAuthenticated={isAuthenticated} />} />
        <Route path="/billboard" element={<Billboard isAuthenticated={isAuthenticated} />} />
        <Route path="/contact" element={<Contact />} />
        
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register onRegister={handleRegister} />} />

        <Route path="/dashboard" element={<OrganizerDashboard />} />

        <Route 
          path="/my-events" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <MyEvents />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/events" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <AdminEvents />
            </ProtectedRoute>
          } 
        />

        <Route
          path="/mytickets"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <MyTickets />
            </ProtectedRoute>
          }
        />

        <Route
          path="/checkout/:id"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Checkout />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default App;