import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import { FaTicketAlt, FaFilm, FaUser, FaEnvelope, FaSignOutAlt, FaSignInAlt, FaUserPlus, FaInfoCircle, FaCalendarPlus } from "react-icons/fa";
import "./Navbar.css";

const AppNavbar = ({ isAuthenticated, userRole, onLogout }) => {
  const getRole = () => {
    if (userRole) return userRole.toLowerCase();
    
    const savedRole = localStorage.getItem('user_role') || localStorage.getItem('role');
    if (savedRole) return savedRole.toLowerCase();

    // 2. Fallback: Descodificar el token JWT guardado para extraer el rol del backend
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const payload = JSON.parse(jsonPayload);
        // Captura tanto el claim estándar de .NET como variaciones comunes
        const tokenRole = 
          payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || 
          payload["role"] || 
          '';
          
        if (tokenRole) return tokenRole.toLowerCase();
      } catch (e) {
        console.error("Error al decodificar el token en el Navbar:", e);
      }
    }

    return '';
  };

  const role = getRole();

  return (
    <Navbar expand="lg" variant="dark" className="main-navbar glass-effect sticky-top">
      <Container fluid className="px-3 px-md-4">
        <Navbar.Brand as={NavLink} to="/billboard" className="d-flex align-items-center me-auto py-0">
          <span className="logo-icon me-2 animate-pulse">
            <FaTicketAlt />
          </span>
          <span className="main-title gradient-text">BIPASS</span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" className="custom-toggler" />

        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-between mt-3 mt-lg-0">
          <Nav className="mx-auto nav-links">
            <Nav.Link as={NavLink} to="/dashboard" className="nav-item-link">
              <FaInfoCircle className="me-2 nav-icon" />
              <span>Inicio</span>
            </Nav.Link>

            <Nav.Link as={NavLink} to="/billboard" className="nav-item-link">
              <FaFilm className="me-2 nav-icon" />
              <span>Cartelera</span>
            </Nav.Link>
            
            {isAuthenticated && role === 'organizer' && (
              <Nav.Link as={NavLink} to="/my-events" className="nav-item-link">
                <FaCalendarPlus className="me-2 nav-icon" />
                <span>My Events</span>
              </Nav.Link>
            )}

            {isAuthenticated && role === 'client' && (
              <Nav.Link as={NavLink} to="/mytickets" className="nav-item-link">
                <FaUser className="me-2 nav-icon" />
                <span>Mis eTickets</span>
              </Nav.Link>
            )}

            {isAuthenticated && (role === 'sysadmin' || role === 'superadmin') && (
              <Nav.Link as={NavLink} to="/admin/events" className="nav-item-link">
                <FaTicketAlt className="me-2 nav-icon" />
                <span>Panel Admin</span>
              </Nav.Link>
            )}
            
            {isAuthenticated && !['organizer', 'client', 'sysadmin', 'superadmin'].includes(role) && (
              <Nav.Link as={NavLink} to="/mytickets" className="nav-item-link">
                <FaUser className="me-2 nav-icon" />
                <span>Mis eTickets</span>
              </Nav.Link>
            )}

            <Nav.Link as={NavLink} to="/contact" className="nav-item-link">
              <FaEnvelope className="me-2 nav-icon" />
              <span>Contacto</span>
            </Nav.Link>
          </Nav>

          <Nav className="d-flex align-items-center gap-2 mt-3 mt-lg-0">
            {isAuthenticated ? (
              <Button 
                variant="outline-danger" 
                size="sm" 
                className="btn-logout d-flex align-items-center justify-content-center gap-2"
                onClick={onLogout}
              >
                <FaSignOutAlt />
                <span>Cerrar Sesión</span>
              </Button>
            ) : (
              <>
                <Button 
                  as={NavLink} 
                  to="/login" 
                  variant="outline-info" 
                  size="sm" 
                  className="d-flex align-items-center gap-1"
                >
                  <FaSignInAlt />
                  <span>Ingresar</span>
                </Button>
                <Button 
                  as={NavLink} 
                  to="/register" 
                  variant="danger" 
                  size="sm" 
                  className="d-flex align-items-center gap-1"
                >
                  <FaUserPlus />
                  <span>Registrarse</span>
                </Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;