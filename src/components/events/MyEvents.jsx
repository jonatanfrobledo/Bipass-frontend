import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Spinner, InputGroup } from 'react-bootstrap';
import { 
  FaEdit, 
  FaTrashAlt, 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaInfoCircle, 
  FaPlus,
  FaDollarSign,
  FaTicketAlt,
  FaExclamationTriangle,
  FaImage,
  FaLink,
  FaFileUpload,
  FaVideo,
  FaGlobe
} from 'react-icons/fa';
import './MyEvents.css';

const MyEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);


  const [imageInputMode, setImageInputMode] = useState('url');
  

  const [currentEvent, setCurrentEvent] = useState({
    id: null,
    name: '',
    description: '',
    date: new Date().toISOString().slice(0, 16),
    imageUrl: '',
    modalityType: 'Presencial',
    isStreaming: false,
    streamingUrl: '',
    venue: { 
      name: '', 
      address: 'Centro de Eventos Rosario', 
      capacity: 250 
    },
    ticketTypes: [
      { name: 'General', price: 8000, quantityAvailable: 100 }
    ]
  });

  const fetchMyEvents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('https://localhost:7030/api/Events/organizer/my-events', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error("Error al cargar los eventos del organizador:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setImageInputMode('url');
    setCurrentEvent({
      id: null,
      name: '',
      description: '',
      date: new Date().toISOString().slice(0, 16),
      imageUrl: '',
      modalityType: 'Presencial',
      isStreaming: false,
      streamingUrl: '',
      venue: { name: '', address: 'Centro de Eventos Rosario', capacity: 250 },
      ticketTypes: [{ name: 'General', price: 8000, quantityAvailable: 100 }]
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (eventItem) => {
    setIsEditing(true);
    setImageInputMode('url');
    
    const isStream = eventItem.isStreaming || false;
    const hasVenue = eventItem.venueName || eventItem.venue?.name;
    let derivedModality = 'Presencial';
    if (isStream && hasVenue) derivedModality = 'Hibrido';
    else if (isStream) derivedModality = 'Online';

    setCurrentEvent({
      id: eventItem.id,
      name: eventItem.name || '',
      description: eventItem.description || '',
      date: eventItem.date ? eventItem.date.substring(0, 16) : new Date().toISOString().slice(0, 16),
      imageUrl: eventItem.imageUrl || eventItem.image || '',
      modalityType: derivedModality,
      isStreaming: isStream,
      streamingUrl: eventItem.streamingUrl || '',
      venue: {
        name: eventItem.venueName || eventItem.venue?.name || '',
        address: eventItem.venue?.address || 'Centro de Eventos Rosario',
        capacity: eventItem.venue?.capacity || 250
      },
      ticketTypes: eventItem.ticketTypes?.length > 0 
        ? eventItem.ticketTypes.map(t => ({ name: t.name || t.Name, price: t.price || t.Price, quantityAvailable: t.quantityAvailable || t.QuantityAvailable }))
        : [{ name: 'General', price: 8000, quantityAvailable: 100 }]
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentEvent({ ...currentEvent, imageUrl: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenDeleteModal = (eventItem) => {
    setEventToDelete(eventItem);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setEventToDelete(null);
    setShowDeleteModal(false);
  };

  const handleConfirmDelete = async () => {
    if (!eventToDelete) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://localhost:7030/api/Events/${eventToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setEvents(events.filter(e => e.id !== eventToDelete.id));
        handleCloseDeleteModal();
      } else {
        alert("No se pudo eliminar el evento.");
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  const handleModalityChange = (selectedModality) => {
    let streamingActive = false;
    let defaultTickets = currentEvent.ticketTypes;

    if (selectedModality === 'Online' || selectedModality === 'Hibrido') {
      streamingActive = true;
      if (selectedModality === 'Online' && !defaultTickets.some(t => t.name.toLowerCase().includes('streaming'))) {
        defaultTickets = [{ name: 'Streaming', price: 5000, quantityAvailable: 500 }];
      }
    } else {
      if (!defaultTickets.some(t => t.name.toLowerCase().includes('general'))) {
        defaultTickets = [{ name: 'General', price: 8000, quantityAvailable: 100 }];
      }
    }

    setCurrentEvent({
      ...currentEvent,
      modalityType: selectedModality,
      isStreaming: streamingActive,
      streamingUrl: streamingActive ? currentEvent.streamingUrl : '',
      ticketTypes: defaultTickets
    });
  };

  const handleAddTicketType = (typeName) => {
    if (currentEvent.ticketTypes.some(t => t.name === typeName)) return; // Evitar duplicados exactos
    setCurrentEvent({
      ...currentEvent,
      ticketTypes: [
        ...currentEvent.ticketTypes,
        { name: typeName, price: 10000, quantityAvailable: 50 }
      ]
    });
  };

  const handleRemoveTicketType = (index) => {
    if (currentEvent.ticketTypes.length <= 1) {
      alert("El evento debe tener al menos un tipo de entrada habilitado.");
      return;
    }
    const updated = currentEvent.ticketTypes.filter((_, i) => i !== index);
    setCurrentEvent({ ...currentEvent, ticketTypes: updated });
  };

  const handleTicketChange = (index, field, value) => {
    const updated = [...currentEvent.ticketTypes];
    updated[index][field] = field === 'price' ? parseFloat(value) || 0 : (field === 'quantityAvailable' ? parseInt(value, 10) || 1 : value);
    setCurrentEvent({ ...currentEvent, ticketTypes: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const url = isEditing 
      ? `https://localhost:7030/api/Events/${currentEvent.id}` 
      : 'https://localhost:7030/api/Events';
    const method = isEditing ? 'PUT' : 'POST';

    const payload = {
      name: currentEvent.name,
      description: currentEvent.description,
      date: currentEvent.date.length === 16 ? `${currentEvent.date}:00` : currentEvent.date,
      isStreaming: Boolean(currentEvent.isStreaming),
      streamingUrl: currentEvent.isStreaming ? currentEvent.streamingUrl : "",
      imageUrl: currentEvent.imageUrl || "",
      venue: {
        name: currentEvent.venue.name,
        address: currentEvent.venue.address || "Centro de Eventos Rosario",
        capacity: Number(currentEvent.venue.capacity) || 250
      },
      ticketTypes: currentEvent.ticketTypes
    };

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setShowModal(false);
        fetchMyEvents();
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.errors ? Object.values(errorData.errors).flat().join('\n') : (errorData.message || "Verifica los datos ingresados.");
        alert("Error al guardar el evento:\n" + errorMsg);
      }
    } catch (error) {
      console.error("Error en submit:", error);
    }
  };

  if (loading) {
    return (
      <div className="myevents-loading-screen">
        <div className="loading-card text-center p-5">
          <Spinner animation="border" variant="danger" style={{ width: '3rem', height: '3rem' }} className="mb-3" />
          <h4 className="text-white fw-semibold">Cargando tus eventos...</h4>
          <p className="text-muted mb-0">Sincronizando panel de organizador</p>
        </div>
      </div>
    );
  }

  return (
    <div className="myevents-wrapper">
      <Container className="py-5">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-5 gap-3">
          <div>
            <span className="events-badge">PANEL DE GESTIÓN</span>
            <h1 className="myevents-title mt-2">
              My <span className="highlight-text">Events</span>
            </h1>
            <p className="myevents-subtitle mb-0">Crea, edita y administra los eventos electrónicos que publicas en la plataforma</p>
          </div>
          <Button className="btn-create-event d-flex align-items-center gap-2" onClick={handleOpenCreateModal}>
            <FaPlus /> Publicar Nuevo Evento
          </Button>
        </div>

        {events.length > 0 ? (
          <Row xs={1} md={2} lg={3} className="g-4">
            {events.map(event => (
              <Col key={event.id}>
                <Card className="event-manage-card h-100 border-0 shadow-sm">
                  {event.imageUrl && (
                    <div style={{ height: '160px', overflow: 'hidden', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
                      <img src={event.imageUrl} alt={event.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                  <Card.Body className="d-flex flex-column p-4">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <span className="event-status-badge me-2">ACTIVO</span>
                        <span className="badge bg-secondary text-light px-2 py-1" style={{ fontSize: '0.65rem' }}>
                          {event.isStreaming ? (event.venueName || event.venue?.name ? 'HÍBRIDO' : 'ONLINE') : 'PRESENCIAL'}
                        </span>
                      </div>
                      <span className="event-id-tag">ID: #{event.id}</span>
                    </div>

                    <Card.Title className="event-card-title mb-3">{event.name}</Card.Title>

                    <div className="event-details-list flex-grow-1 mb-4">
                      <div className="detail-item">
                        <FaCalendarAlt className="detail-icon" />
                        <span>{new Date(event.date).toLocaleDateString('es-AR', { dateStyle: 'long' })}</span>
                      </div>
                      <div className="detail-item">
                        <FaMapMarkerAlt className="detail-icon" />
                        <span>{event.venueName || event.venue?.name || (event.isStreaming ? 'Transmisión Online' : 'Ubicación fija')}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-top border-secondary-subtle d-flex justify-content-end gap-2 mt-auto">
                      <Button variant="outline-info" size="sm" className="btn-action-glow" onClick={() => handleOpenEditModal(event)}>
                        <FaEdit /> Editar
                      </Button>
                      <Button variant="outline-danger" size="sm" className="btn-action-danger-glow" onClick={() => handleOpenDeleteModal(event)}>
                        <FaTrashAlt /> Eliminar
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <div className="empty-events-glass text-center p-5 mx-auto" style={{ maxWidth: '600px' }}>
            <FaInfoCircle className="fs-1 text-danger mb-3" />
            <h4 className="text-white fw-semibold">No tienes eventos publicados</h4>
            <p className="text-muted mb-4">Todavía no has creado ningún evento en la plataforma. ¡Comienza publicando el primero!</p>
            <Button className="btn-create-event" onClick={handleOpenCreateModal}>
              <FaPlus className="me-2" /> Crear mi primer evento
            </Button>
          </div>
        )}

        <Modal show={showModal} onHide={handleCloseModal} centered contentClassName="dark-glass-modal" size="lg">
          <Modal.Header closeButton className="border-0 pb-0">
            <Modal.Title className="text-white fw-bold">
              {isEditing ? 'Editar Evento' : 'Publicar Nuevo Evento'}
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSubmit}>
            <Modal.Body className="p-4" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
              <Form.Group className="mb-3">
                <Form.Label className="text-muted">Nombre del Evento</Form.Label>
                <Form.Control 
                  type="text" 
                  className="custom-form-input" 
                  required
                  value={currentEvent.name}
                  onChange={(e) => setCurrentEvent({...currentEvent, name: e.target.value})}
                  placeholder="Ej: Electronic Sunset Festival"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="text-muted">Descripción</Form.Label>
                <Form.Control 
                  as="textarea" 
                  rows={3} 
                  className="custom-form-input"
                  value={currentEvent.description}
                  onChange={(e) => setCurrentEvent({...currentEvent, description: e.target.value})}
                  placeholder="Detalles del line-up, horarios, etc."
                />
              </Form.Group>

              <Row>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label className="text-muted">Modalidad de Asistencia</Form.Label>
                    <div className="d-flex gap-2">
                      {['Presencial', 'Online', 'Hibrido'].map((mod) => (
                        <Button
                          key={mod}
                          type="button"
                          className={`btn-mode-selector flex-grow-1 ${currentEvent.modalityType === mod ? 'active' : ''}`}
                          onClick={() => handleModalityChange(mod)}
                        >
                          {mod === 'Presencial' && <FaMapMarkerAlt className="me-1" />}
                          {mod === 'Online' && <FaGlobe className="me-1" />}
                          {mod === 'Hibrido' && <FaVideo className="me-1" />}
                          {mod}
                        </Button>
                      ))}
                    </div>
                  </Form.Group>
                </Col>

                {(currentEvent.modalityType === 'Online' || currentEvent.modalityType === 'Hibrido') && (
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label className="text-muted">Link de Transmisión (Streaming URL)</Form.Label>
                      <InputGroup className="custom-input-group">
                        <InputGroup.Text className="datetime-icon-bg">
                          <FaVideo />
                        </InputGroup.Text>
                        <Form.Control 
                          type="url" 
                          className="custom-form-input"
                          placeholder="https://youtube.com/live/... o plataforma de streaming"
                          required={currentEvent.isStreaming}
                          value={currentEvent.streamingUrl}
                          onChange={(e) => setCurrentEvent({...currentEvent, streamingUrl: e.target.value})}
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>
                )}
              </Row>

              <Form.Group className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <Form.Label className="text-muted mb-0">Imagen de Portada del Evento</Form.Label>
                  <div className="btn-group btn-group-sm gap-2" role="group">
                    <Button 
                      className={`btn-mode-selector ${imageInputMode === 'url' ? 'active' : ''}`}
                      onClick={() => setImageInputMode('url')}
                      type="button"
                    >
                      <FaLink className="me-1" /> URL Web
                    </Button>
                    <Button 
                      className={`btn-mode-selector ${imageInputMode === 'file' ? 'active' : ''}`}
                      onClick={() => setImageInputMode('file')}
                      type="button"
                    >
                      <FaFileUpload className="me-1" /> Subir Archivo
                    </Button>
                  </div>
                </div>

                {imageInputMode === 'url' ? (
                  <InputGroup className="custom-input-group">
                    <InputGroup.Text className="datetime-icon-bg">
                      <FaImage />
                    </InputGroup.Text>
                    <Form.Control 
                      type="url" 
                      className="custom-form-input"
                      placeholder="https://ejemplo.com/imagen.jpg"
                      value={currentEvent.imageUrl}
                      onChange={(e) => setCurrentEvent({...currentEvent, imageUrl: e.target.value})}
                    />
                  </InputGroup>
                ) : (
                  <InputGroup className="custom-input-group">
                    <InputGroup.Text className="datetime-icon-bg">
                      <FaFileUpload />
                    </InputGroup.Text>
                    <Form.Control 
                      type="file" 
                      accept="image/*"
                      className="custom-form-input"
                      onChange={handleImageFileChange}
                    />
                  </InputGroup>
                )}

                {currentEvent.imageUrl && (
                  <div className="mt-2 text-center p-2 rounded" style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.1)' }}>
                    <small className="text-muted d-block mb-1">Vista previa de la portada:</small>
                    <img src={currentEvent.imageUrl} alt="Preview" style={{ maxHeight: '90px', borderRadius: '6px', objectFit: 'contain' }} />
                  </div>
                )}
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="text-muted">Fecha y Hora del Evento</Form.Label>
                    <InputGroup className="custom-input-group">
                      <InputGroup.Text className="datetime-icon-bg">
                        <FaCalendarAlt />
                      </InputGroup.Text>
                      <Form.Control 
                        type="datetime-local" 
                        className="custom-form-input datetime-input-styled" 
                        required
                        value={currentEvent.date}
                        onChange={(e) => setCurrentEvent({...currentEvent, date: e.target.value})}
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="text-muted">Nombre del Venue / Lugar</Form.Label>
                    <Form.Control 
                      type="text" 
                      className="custom-form-input"
                      required
                      value={currentEvent.venue?.name || ''}
                      onChange={(e) => setCurrentEvent({
                        ...currentEvent, 
                        venue: { ...currentEvent.venue, name: e.target.value }
                      })}
                      placeholder="Ej: Complejo Forest"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <div className="p-3 rounded mb-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="text-white fw-bold"><FaTicketAlt className="me-2 text-warning" /> Tipos de Entradas y Precios</span>
                  
                  {/* Botones rápidos para agregar tipos según la modalidad */}
                  <div className="d-flex gap-1 flex-wrap">
                    {currentEvent.modalityType !== 'Online' && (
                      <>
                        <Button size="sm" variant="outline-light" onClick={() => handleAddTicketType('General')}>+ General</Button>
                        <Button size="sm" variant="outline-light" onClick={() => handleAddTicketType('VIP')}>+ VIP</Button>
                        <Button size="sm" variant="outline-light" onClick={() => handleAddTicketType('Backstage')}>+ Backstage</Button>
                      </>
                    )}
                    {(currentEvent.modalityType === 'Online' || currentEvent.modalityType === 'Hibrido') && (
                      <>
                        <Button size="sm" variant="outline-info" onClick={() => handleAddTicketType('Streaming')}>+ Streaming</Button>
                        <Button size="sm" variant="outline-info" onClick={() => handleAddTicketType('All Access - Backstage')}>+ All Access</Button>
                      </>
                    )}
                  </div>
                </div>

                {currentEvent.ticketTypes.map((ticket, idx) => (
                  <div key={idx} className="p-2 mb-2 rounded d-flex align-items-center gap-2" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <Form.Control 
                      type="text"
                      className="custom-form-input form-control-sm"
                      placeholder="Nombre (Ej: VIP)"
                      value={ticket.name}
                      onChange={(e) => handleTicketChange(idx, 'name', e.target.value)}
                      style={{ maxWidth: '140px' }}
                      required
                    />
                    <InputGroup size="sm" className="custom-input-group">
                      <InputGroup.Text><FaDollarSign /></InputGroup.Text>
                      <Form.Control 
                        type="number"
                        min="0"
                        placeholder="Precio"
                        value={ticket.price}
                        onChange={(e) => handleTicketChange(idx, 'price', e.target.value)}
                        required
                      />
                    </InputGroup>
                    <InputGroup size="sm" className="custom-input-group">
                      <InputGroup.Text><FaTicketAlt /></InputGroup.Text>
                      <Form.Control 
                        type="number"
                        min="1"
                        placeholder="Stock"
                        value={ticket.quantityAvailable}
                        onChange={(e) => handleTicketChange(idx, 'quantityAvailable', e.target.value)}
                        required
                      />
                    </InputGroup>
                    <Button variant="outline-danger" size="sm" onClick={() => handleRemoveTicketType(idx)}>
                      <FaTrashAlt />
                    </Button>
                  </div>
                ))}
              </div>

            </Modal.Body>
            <Modal.Footer className="border-0 pt-0 pb-4">
              <Button variant="secondary" onClick={handleCloseModal}>
                Cancelar
              </Button>
              <Button type="submit" className="btn-create-event">
                {isEditing ? 'Guardar Cambios' : 'Publicar Evento'}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered contentClassName="dark-glass-modal">
          <Modal.Header closeButton className="border-0 pb-0">
            <Modal.Title className="text-white fw-bold d-flex align-items-center gap-2">
              <FaExclamationTriangle className="text-danger" /> Confirmar Eliminación
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4 text-center">
            <p className="text-muted mb-2">¿Estás seguro de que deseas eliminar permanentemente el evento:</p>
            <h5 className="text-white fw-bold mb-3">{eventToDelete?.name}</h5>
            <p className="text-danger small mb-0">Esta acción no se puede deshacer y removerá el acceso de la cartelera.</p>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0 pb-4 justify-content-center gap-2">
            <Button variant="outline-light" onClick={handleCloseDeleteModal} className="px-4">
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete} className="px-4 fw-semibold">
              Sí, Eliminar Evento
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default MyEvents;