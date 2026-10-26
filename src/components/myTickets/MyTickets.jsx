import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, InputGroup, Form, Modal } from 'react-bootstrap';
import { 
  FaTicketAlt, 
  FaInfoCircle, 
  FaDownload, 
  FaEnvelope, 
  FaTimes, 
  FaSearch, 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaChair 
} from 'react-icons/fa';
import { BsQrCodeScan } from 'react-icons/bs';
import './MyTickets.css';

const MOCK_TICKETS = [
  {
    id: 1,
    event: 'International Music Festival',
    date: 'October 15, 2025',
    location: 'Parque Independencia, Rosario',
    seat: 'PLATEA A - Fila 3 - Butaca 12',
    price: 4500,
    qr_code_url: 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=Ticket1',
    pdf_url: '#'
  },
  {
    id: 2,
    event: 'Rock Legends Concert',
    date: 'October 22, 2025',
    location: 'Metropolitano, Rosario',
    seat: 'VIP - Fila 1 - Butaca 5',
    price: 5500,
    qr_code_url: 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=Ticket2',
    pdf_url: '#'
  },
  {
    id: 3,
    event: 'Stand-Up Comedy Night',
    date: 'November 5, 2025',
    location: 'Teatro El Círculo, Rosario',
    seat: 'PLATEA B - Fila 5 - Butaca 20',
    price: 3200,
    qr_code_url: 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=Ticket3',
    pdf_url: '#'
  }
];

const MyTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTickets(MOCK_TICKETS);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleOpenModal = (ticket) => {
    setSelectedTicket(ticket);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedTicket(null);
    setShowModal(false);
  };

  const filteredTickets = tickets.filter(
    t =>
      t.event.toLowerCase().includes(search.toLowerCase()) ||
      t.location.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="mytickets-loading-screen">
        <div className="loading-card text-center p-5">
          <div className="spinner-border text-purple mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Cargando...</span>
          </div>
          <h4 className="text-white fw-semibold">Cargando tus entradas...</h4>
          <p className="text-muted mb-0">Recuperando tu pase digital</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mytickets-wrapper">
      <Container className="py-5">
        <div className="text-center mb-5">
          <span className="tickets-badge">ACCESO DIGITAL</span>
          <h1 className="mytickets-title mt-2">
            Mis <span className="highlight-text">e-Tickets</span>
          </h1>
          <p className="mytickets-subtitle">Aquí puedes consultar, descargar y gestionar tus entradas adquiridas</p>
        </div>
        <div className="mytickets-search-container mb-5">
          <InputGroup className="custom-input-group mx-auto" style={{ maxWidth: '580px' }}>
            <InputGroup.Text className="input-icon-bg">
              <FaSearch />
            </InputGroup.Text>
            <Form.Control
              type="text"
              className="custom-form-input"
              placeholder="Buscar por evento o ubicación..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>
        </div>

        {filteredTickets.length > 0 ? (
          <Row xs={1} md={2} lg={3} className="g-4">
            {filteredTickets.map(ticket => (
              <Col key={ticket.id}>
                <Card className="ticket-card-v2 h-100 border-0">
                  
                  <div className="ticket-stub-header">
                    <div className="d-flex align-items-center gap-2">
                      <FaTicketAlt className="ticket-stub-icon" />
                      <span className="ticket-stub-label">PASE VÁLIDO</span>
                    </div>
                    <span className="ticket-type-tag">E-TICKET</span>
                  </div>

                  <Card.Body className="d-flex flex-column p-4">
                    <Card.Title className="ticket-event-title mb-3">{ticket.event}</Card.Title>

                    <div className="ticket-details-list flex-grow-1 mb-4">
                      <div className="detail-item">
                        <FaCalendarAlt className="detail-icon" />
                        <span>{ticket.date}</span>
                      </div>
                      <div className="detail-item">
                        <FaMapMarkerAlt className="detail-icon" />
                        <span>{ticket.location}</span>
                      </div>
                      <div className="detail-item">
                        <FaChair className="detail-icon" />
                        <span>{ticket.seat}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-top border-secondary-subtle d-flex justify-content-between align-items-center mt-auto">
                      <div>
                        <span className="price-label d-block text-muted">Precio</span>
                        <span className="price-value">${ticket.price.toLocaleString()}</span>
                      </div>
                      <Button className="btn-ticket-action" onClick={() => handleOpenModal(ticket)}>
                        <BsQrCodeScan className="me-2" /> Ver ticket
                      </Button>
                    </div>

                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <div className="empty-tickets-glass text-center p-5 mx-auto" style={{ maxWidth: '600px' }}>
            <FaInfoCircle className="fs-1 text-purple mb-3" />
            <h4 className="text-white fw-semibold">No se encontraron tickets</h4>
            <p className="text-muted mb-0">No tienes entradas adquiridas que coincidan con tu búsqueda.</p>
          </div>
        )}

        <Modal 
          show={showModal} 
          onHide={handleCloseModal} 
          centered 
          contentClassName="dark-glass-modal"
        >
          {selectedTicket && (
            <>
              <Modal.Header closeButton className="border-0 pb-0">
                <Modal.Title className="w-100 text-center text-white fw-bold fs-4">
                  {selectedTicket.event}
                </Modal.Title>
              </Modal.Header>

              <Modal.Body className="p-4 text-center">

                <div className="qr-box-container mb-4">
                  <div className="qr-wrapper">
                    <img src={selectedTicket.qr_code_url} alt="Código QR" className="qr-image" />
                  </div>
                  <span className="qr-instruction">Presenta este código QR en el ingreso</span>
                </div>

                <div className="modal-ticket-details mb-4">
                  <div className="modal-detail-row">
                    <FaCalendarAlt className="row-icon" />
                    <div>
                      <small className="d-block text-muted">Fecha del Evento</small>
                      <strong className="text-white">{selectedTicket.date}</strong>
                    </div>
                  </div>

                  <div className="modal-detail-row">
                    <FaMapMarkerAlt className="row-icon" />
                    <div>
                      <small className="d-block text-muted">Ubicación</small>
                      <strong className="text-white">{selectedTicket.location}</strong>
                    </div>
                  </div>

                  <div className="modal-detail-row">
                    <FaChair className="row-icon" />
                    <div>
                      <small className="d-block text-muted">Asiento / Zona</small>
                      <strong className="text-white">{selectedTicket.seat}</strong>
                    </div>
                  </div>
                </div>

                <div className="d-flex flex-wrap justify-content-center gap-3">
                  <Button 
                    variant="success" 
                    className="btn-modal-action btn-download-pdf" 
                    href={selectedTicket.pdf_url} 
                    target="_blank"
                  >
                    <FaDownload className="me-2" /> Descargar PDF
                  </Button>

                  <Button variant="outline-light" className="btn-modal-action btn-resend-email">
                    <FaEnvelope className="me-2" /> Reenviar Email
                  </Button>
                </div>

              </Modal.Body>

              <Modal.Footer className="border-0 pt-0 justify-content-center pb-4">
                <Button className="btn-modal-close" onClick={handleCloseModal}>
                  <FaTimes className="me-2" /> Cerrar
                </Button>
              </Modal.Footer>
            </>
          )}
        </Modal>

      </Container>
    </div>
  );
};

export default MyTickets;