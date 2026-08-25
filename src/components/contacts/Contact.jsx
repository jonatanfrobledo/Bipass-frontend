// src/components/contact/Contact.jsx
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { FaLinkedin, FaGithub, FaEnvelope, FaRocket, FaHeadset, FaPaperPlane } from "react-icons/fa";
import "./Contact.css";

const developers = [
  {
    name: "Jonatan Robledo",
    role: "Software Developer",
    image: "/images/Jonatan.jpg", // Rutas públicas en React/Vite inician desde la raíz '/'
    linkedin: "https://www.linkedin.com/in/jonatan-francisco-robledo-/",
    github: "https://github.com/jonatanfrobledo",
    email: "mailto:jrobledo@mail.austral.edu.com",
  }
];

const Contact = () => {
  return (
    <div className="contact-wrapper">
      <Container className="py-5">
        
        {/* Encabezado Principal */}
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

        {/* Tarjeta del Desarrollador / Equipo */}
        <Row className="mb-5 justify-content-center">
          {developers.map((dev, idx) => (
            <Col key={idx} md={8} lg={6} xl={5} className="text-center">
              <Card className="dev-glass-card border-0 h-100">
                <Card.Body className="p-4 d-flex flex-column align-items-center">
                  
                  {/* Foto de Perfil con Anillo Glowing */}
                  <div className="dev-avatar-container mb-3">
                    <img
                      src={dev.image}
                      alt={dev.name}
                      className="dev-avatar-img"
                      onError={(e) => {
                        // Fallback si la imagen no carga
                        e.target.src = "https://ui-avatars.com/api/?name=Jonatan+Robledo&background=8b5cf6&color=fff&size=200";
                      }}
                    />
                  </div>

                  <Card.Title className="dev-name mb-1">{dev.name}</Card.Title>
                  <span className="dev-role mb-3">{dev.role}</span>

                  {/* Redes Sociales */}
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

        {/* Sección Publicación de Eventos */}
        <Row className="justify-content-center">
          <Col md={10} lg={8} xl={7}>
            <Card className="event-publisher-card border-0 p-4 p-md-5">
              <Card.Body className="text-center">
                <div className="publisher-icon-wrapper mb-3 mx-auto">
                  <FaRocket className="publisher-icon" />
                </div>

                <h3 className="publisher-title mb-3">¿Queres publicar tu evento?</h3>
                
                <p className="publisher-description mb-4">
                  Promociona tu show, recital o conferencia en nuestra plataforma. Llega a miles de espectadores con gestión de entradas e-tickets en tiempo real y validación por QR.
                </p>

                <Button className="btn-publisher-action px-4 py-3">
                  <FaPaperPlane className="me-2" /> Cómo publicar tu evento
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>

      </Container>
    </div>
  );
};

export default Contact;