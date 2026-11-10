import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, InputGroup, Form, Modal, Alert } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import { 
  FaTicketAlt, 
  FaInfoCircle, 
  FaDownload, 
  FaEnvelope, 
  FaTimes, 
  FaSearch, 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaChair,
  FaCheckCircle
} from 'react-icons/fa';
import { BsQrCodeScan } from 'react-icons/bs';
import { getMyOrders } from '../../services/apiService';
import './MyTickets.css';

const MyTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const fetchUserTickets = async () => {
      try {
        setLoading(true);

        const queryParams = new URLSearchParams(location.search);
        const paymentStatus = queryParams.get('status') || queryParams.get('collection_status');

        if (paymentStatus === 'approved') {
          setShowSuccessAlert(true);
        }

        const response = await getMyOrders();
        const rawOrders = Array.isArray(response) ? response : (response?.data || response?.result || []);

        const formattedTickets = rawOrders.map((order, index) => {
          const orderId = order.id || order.Id || index + 1;
          const orderStatus = String(order.status || order.Status || 'Pending').toLowerCase();

          let orderEventInfo = null;
          try {
            const storedSpecific = sessionStorage.getItem(`order_event_${orderId}`);
            if (storedSpecific) {
              orderEventInfo = JSON.parse(storedSpecific);
            } else {
              const storedGeneral = sessionStorage.getItem('last_purchased_event');
              if (storedGeneral) orderEventInfo = JSON.parse(storedGeneral);
            }
          } catch (e) {
            console.warn("Storage warning:", e);
          }

          const itemsList = order.items || order.OrderItems || order.orderItems || [];
          
          const seatDescription = itemsList.length > 0 
            ? itemsList.map(i => {
                const qty = i.quantity || i.Quantity || 1;
                const tName = i.ticketTypeName || i.TicketTypeName || i.ticketType?.name || i.TicketType?.Name || 'Entrada General';
                return `${qty}x ${tName}`;
              }).join(', ') 
            : "GENERAL / DIGITAL PASS";

          const eventTitle = 
            order.eventTitle || 
            order.EventTitle || 
            order.event?.title || 
            order.Event?.Title || 
            order.event?.name || 
            order.Event?.Name || 
            orderEventInfo?.title || 
            `Evento #${orderId}`;

          const eventLocation = 
            order.location || 
            order.Location || 
            order.event?.location || 
            order.Event?.Location || 
            orderEventInfo?.location || 
            "Rosario, Santa Fe";

          const rawDate = order.date || order.Date || order.orderDate || order.OrderDate;
          const eventDate = rawDate ? rawDate.split("T")[0] : (orderEventInfo?.date || new Date().toISOString().split("T")[0]);

          const totalPrice = order.totalAmount || order.TotalAmount || order.total || order.Total || orderEventInfo?.total || 12000;

          return {
            id: orderId,
            event: eventTitle,
            date: eventDate,
            location: eventLocation,
            seat: seatDescription,
            price: totalPrice,
            status: orderStatus,
            qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=BIPASS-ORDER-${orderId}`,
            pdf_url: "#"
          };
        });

        const approvedTickets = formattedTickets.filter(t => 
          t.status === 'approved' || 
          t.status === 'aprobada' || 
          t.status === 'completed' || 
          t.status === 'paid' ||
          t.status === '1' ||
          t.status === '2'
        );

        setTickets(approvedTickets);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setTickets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserTickets();
  }, [location]);

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
      (t.event && t.event.toLowerCase().includes(search.toLowerCase())) ||
      (t.location && t.location.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="mytickets-loading-screen">
        <div className="loading-card text-center p-5">
          <div className="spinner-border text-danger mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Cargando...</span>
          </div>
          <h4 className="text-white fw-semibold">Cargando tus entradas...</h4>
          <p className="text-muted mb-0">Verificando bases de datos de pago</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mytickets-wrapper">
      <Container className="py-5">
        
        {showSuccessAlert && (
          <Alert variant="success" className="d-flex align-items-center gap-3 mb-4 shadow-sm border-0 alert-success-glass" onClose={() => setShowSuccessAlert(false)} dismissible>
            <FaCheckCircle size={28} className="text-success flex-shrink-0" />
            <div>
              <Alert.Heading className="fw-bold mb-1 fs-5">¡Pago aprobado con éxito!</Alert.Heading>
              <p className="mb-0 text-muted">La transacción fue verificada en el sistema. Tu entrada ya se encuentra disponible.</p>
            </div>
          </Alert>
        )}

        <div className="text-center mb-5">
          <span className="tickets-badge">ACCESO DIGITAL</span>
          <h1 className="mytickets-title mt-2">
            Mis <span className="highlight-text">e-Tickets</span>
          </h1>
          <p className="mytickets-subtitle">Entradas verificadas y acreditadas por tu cuenta</p>
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
                        <span className="price-value">${Number(ticket.price || 0).toLocaleString('es-AR')}</span>
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
            <FaInfoCircle className="fs-1 text-danger mb-3" />
            <h4 className="text-white fw-semibold">No se encontraron tickets acreditados</h4>
            <p className="text-muted mb-0">No posees entradas con pagos aprobados en este momento.</p>
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
                      <small className="d-block text-muted">Zona / Tipo</small>
                      <strong className="text-white">{selectedTicket.seat}</strong>
                    </div>
                  </div>
                </div>

                <div className="d-flex flex-wrap justify-content-center gap-3">
                  <Button 
                    variant="success" 
                    className="btn-modal-action btn-download-pdf" 
                    href={selectedTicket.pdf_url || '#'} 
                    target="_blank"
                  >
                    <FaDownload className="me-2" /> Descargar PDF
                  </Button>

                  <Button variant="outline-light" className="btn-modal-action btn-resend-email">
                    <FaEnvelope className="me-2" /> Enviar a Email
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