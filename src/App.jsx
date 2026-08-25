import { useState } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import Login from "./components/login/Login";
import Dashboard from "./components/dashboard/Dashboard";
import Register from "./components/register/Register";
import Billboard from "./components/billboard/Billboard";
import AppNavbar from "./components/navbar/Navbar"; 
import Contact from "./components/contacts/Contact";
import MyTickets from "./components/myTickets/MyTickets";
import Checkout from "./components/checkout/Checkout";
import { login as loginApi, register as registerApi } from './services/apiService';

/* ----------------------------------------------------
   GUARD PARA RUTAS PRIVADAS
   ---------------------------------------------------- */
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

  const navigate = useNavigate();

  // LOGIN CONECTADO AL BACKEND
  const handleLogin = async (email, password, redirectPath = '/billboard') => {
    try {
      const response = await loginApi({ email, password });
      console.log("Login exitoso:", response);  
      if (response && response.token) {
        setIsAuthenticated(true);
        navigate(redirectPath);
      }
    } catch (error) {
      alert("Error al iniciar sesión: " + (error.message || "Credenciales inválidas"));
    }
  };

  // REGISTRO CONECTADO AL BACKEND
  const handleRegister = async (userData) => {
    try {
      await registerApi(userData);
      const loginResponse = await loginApi({ 
        email: userData.email, 
        password: userData.password 
      });

      if (loginResponse && loginResponse.token) {
        setIsAuthenticated(true);
        navigate('/billboard');
      } else {
        navigate('/login');
      }
    } catch (error) {
      alert("Error en el registro: " + (error.message || "No se pudo registrar"));
    }
  };

  // CERRAR SESIÓN
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    navigate('/');
  };

  return (
    <>
      <AppNavbar isAuthenticated={isAuthenticated} onLogout={handleLogout} />

      <Routes>
        {/* RUTAS PÚBLICAS PRINCIPALES */}
        <Route path="/"element={<Billboard isAuthenticated={isAuthenticated} />} />
        <Route path="/billboard" element={<Billboard isAuthenticated={isAuthenticated} />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {/* AUTENTICACIÓN */}
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register onRegister={handleRegister} />} />

        {/* RUTAS PRIVADAS */}
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

        {/* RUTA POR DEFECTO */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default App;