import { useState } from "react";
import { Container, Row, Col, Card, Button, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaLinkedin, FaGithub, FaEnvelope, FaRocket, FaHeadset, FaPaperPlane, FaExclamationTriangle } from "react-icons/fa";
import "./Contact.css";

const developers = [
  {
    name: "Jonatan Robledo",
    role: "Software Developer",
    image: "/images/Jonatan.jpg",
    linkedin: "https://www.linkedin.com/in/jonatan-francisco-robledo-/",
    github: "https://github.com/jonatanfrobledo",
    email: "mailto:jrobledo@mail.austral.edu.com",
  }
];

const Contact = () => {
  const navigate = useNavigate();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: "",
    message: "",
    isLoginRedirect: false
  });

  const handlePublishClick = () => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role') || localStorage.getItem('userRole');

    if (!token) {
      setModalConfig({
        title: "Acceso Requerido",
        message: "Debes iniciar sesión con una cuenta de organizador para poder publicar tu evento en la plataforma.",
        isLoginRedirect: true
      });
      setShowAuthModal(true);
      return;
    }

    if (userRole && userRole.toLowerCase() !== 'organizador') {
      setModalConfig({
        title: "Permiso Denegado",
        message: "Tu cuenta actual no cuenta con perfil de Organizador. Solo los organizadores autorizados pueden publicar nuevos eventos.",
        isLoginRedirect: false
      });
      setShowAuthModal(true);
      return;
    }

    navigate('/my-events', { state: { openCreateModal: true } });
  };

  const handleModalAction = () => {
    setShowAuthModal(false);
    if (modalConfig.isLoginRedirect) {
      navigate('/login');
    }
  };

  return (
    <div className="contact-wrapper">
      <Container className="py-5">
        
        <div className="text-center mb-5">
          <span className="contact-badge">
            <FaHeadset className="me-2" /> SOPORTE & DESARROLLO
          </span>
          <h1 className="contact-title mt-2">
            Centro de <span className="highlight-text">Ayuda</span>
          </h1>
          <p className="contact-subtitle mx-auto" style={{ maxWidth: '600px' }}>
            ¿Tienes preguntas sobre la plataforma o necesitas asistencia técnica?
          </p>
          <p className="contact-subtitle mx-auto" style={{ maxWidth: '600px' }}>
            Estamos aquí para ayudarte.
          </p>
        </div>

        <Row className="mb-5 justify-content-center">
          {developers.map((dev, idx) => (
            <Col key={idx} md={8} lg={6} xl={5} className="text-center">
              <Card className="dev-glass-card border-0 h-100">
                <Card.Body className="p-4 d-flex flex-column align-items-center">
                  
                  <div className="dev-avatar-container mb-3">
                    <img
                      src={dev.image}
                      alt={dev.name}
                      className="dev-avatar-img"
                      onError={(e) => {
                        e.target.src = "https://ui-avatars.com/api/?name=Jonatan+Robledo&background=8b5cf6&color=fff&size=200";
                      }}
                    />
                  </div>

                  <Card.Title className="dev-name mb-1">{dev.name}</Card.Title>
                  <span className="dev-role mb-3">{dev.role}</span>

                  <div className="d-flex justify-content-center gap-3 mt-2">
                    <a
                      href={dev.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="social-btn btn-linkedin"
                      title="LinkedIn"
                    >
                      <FaLinkedin size={20} />
                    </a>
                    <a
                      href={dev.github}
                      target="_blank"
                      rel="noreferrer"
                      className="social-btn btn-github"
                      title="GitHub"
                    >
                      <FaGithub size={20} />
                    </a>
                    <a
                      href={dev.email}
                      className="social-btn btn-email"
                      title="Email"
                    >
                      <FaEnvelope size={20} />
                    </a>
                  </div>

                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        <Row className="justify-content-center">
          <Col md={10} lg={8} xl={7}>
            <Card className="event-publisher-card border-0 p-4 p-md-5">
              <Card.Body className="text-center">
                <div className="publisher-icon-wrapper mb-3 mx-auto">
                  <FaRocket className="publisher-icon" />
                </div>

                <h3 className="publisher-title mb-3">¿Querés publicar tu evento?</h3>
                
                <p className="publisher-description mb-4">
                  Promociona tu show, recital o conferencia en nuestra plataforma. Llega a miles de espectadores con gestión de entradas e-tickets en tiempo real y validación por QR.
                </p>

                <Button className="btn-publisher-action px-4 py-3" onClick={handlePublishClick}>
                  <FaPaperPlane className="me-2" /> Cómo publicar tu evento
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>

      </Container>
      <Modal 
        show={showAuthModal} 
        onHide={() => setShowAuthModal(false)} 
        centered 
        contentClassName="dark-glass-modal"
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="text-white fw-bold d-flex align-items-center gap-2">
            <FaExclamationTriangle className="text-danger" /> {modalConfig.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4 text-center">
          <p className="text-muted mb-0">{modalConfig.message}</p>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0 pb-4 justify-content-center gap-2">
          <Button variant="outline-light" onClick={() => setShowAuthModal(false)} className="px-4">
            Cancelar
          </Button>
          <Button onClick={handleModalAction} className="btn-create-event px-4">
            {modalConfig.isLoginRedirect ? 'Ir a Iniciar Sesión' : 'Entendido'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Contact;