import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import { FaTicketAlt, FaFilm, FaUser, FaEnvelope, FaSignOutAlt, FaSignInAlt, FaUserPlus, FaInfoCircle } from "react-icons/fa";
import "./Navbar.css";

const AppNavbar = ({ isAuthenticated, onLogout }) => {
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
            
            
            {isAuthenticated && (
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