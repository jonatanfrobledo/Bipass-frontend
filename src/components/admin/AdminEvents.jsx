import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal, Spinner, Table, Nav, Form, InputGroup } from 'react-bootstrap';
import { 
  FaShieldAlt, 
  FaTrashAlt, 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaInfoCircle, 
  FaExclamationTriangle,
  FaUsers,
  FaTicketAlt,
  FaEdit,
  FaPlus,
  FaDollarSign,
  FaImage,
  FaLink,
  FaFileUpload,
  FaVideo,
  FaGlobe
} from 'react-icons/fa';
import { getEvents, deleteEvent, updateEvent, createEvent, getUsers, updateUser, deleteUser } from '../../services/apiService'; 
import '../events/MyEvents.css'; 
import './AdminEvents.css';

const AdminEvents = () => {
  const [activeTab, setActiveTab] = useState('events');
  
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showDeleteEventModal, setShowDeleteEventModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);

  const [showEventModal, setShowEventModal] = useState(false);
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const [imageInputMode, setImageInputMode] = useState('url');

  const [eventFormData, setEventFormData] = useState({
    id: null,
    title: '',
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

  const [users, setUsers] = useState([]);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const [userFormData, setUserFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    role: 'User'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [eventsData, usersData] = await Promise.all([
        getEvents().catch(() => []),
        getUsers().catch(() => [])
      ]);

      const listaEventos = Array.isArray(eventsData) ? eventsData : (eventsData?.items || []);
      setEvents(listaEventos);

      const listaUsuarios = Array.isArray(usersData) ? usersData : (usersData?.items || []);
      setUsers(listaUsuarios);
    } catch (error) {
      console.error("Error al cargar los datos del panel de administración:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatRole = (roleValue) => {
    const roleStr = String(roleValue).trim();
    if (roleStr === '0' || roleStr.toLowerCase() === 'client' || roleStr.toLowerCase() === 'user') {
      return { label: 'Cliente', variant: 'info' };
    }
    if (roleStr === '1' || roleStr.toLowerCase() === 'organizer') {
      return { label: 'Organizador', variant: 'warning' };
    }
    if (roleStr === '2' || roleStr.toLowerCase() === 'superadmin' || roleStr.toLowerCase() === 'admin') {
      return { label: 'Administrador', variant: 'danger' };
    }
    return { label: roleStr || 'Usuario', variant: 'secondary' };
  };

  const handleOpenCreateEventModal = () => {
    setIsEditingEvent(false);
    setImageInputMode('url');
    setEventFormData({
      id: null,
      title: '',
      description: '',
      date: new Date().toISOString().slice(0, 16),
      imageUrl: '',
      modalityType: 'Presencial',
      isStreaming: false,
      streamingUrl: '',
      venue: { name: '', address: 'Centro de Eventos Rosario', capacity: 250 },
      ticketTypes: [{ name: 'General', price: 8000, quantityAvailable: 100 }]
    });
    setShowEventModal(true);
  };

  const handleOpenEditEventModal = (eventItem) => {
    setIsEditingEvent(true);
    setImageInputMode('url');

    const isStream = eventItem.isStreaming || false;
    const hasVenue = eventItem.venueName || eventItem.venue?.name;
    let derivedModality = 'Presencial';
    if (isStream && hasVenue) derivedModality = 'Hibrido';
    else if (isStream) derivedModality = 'Online';
    
    setEventFormData({
      id: eventItem.id || eventItem.Id,
      title: eventItem.title || eventItem.Title || eventItem.name || eventItem.Name || '',
      description: eventItem.description || eventItem.Description || '',
      date: eventItem.date ? eventItem.date.substring(0, 16) : new Date().toISOString().slice(0, 16),
      imageUrl: eventItem.imageUrl || eventItem.ImageUrl || eventItem.image || '',
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
    setShowEventModal(true);
  };

  const handleModalityChange = (selectedModality) => {
    let streamingActive = false;
    let defaultTickets = eventFormData.ticketTypes;

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

    setEventFormData({
      ...eventFormData,
      modalityType: selectedModality,
      isStreaming: streamingActive,
      streamingUrl: streamingActive ? eventFormData.streamingUrl : '',
      ticketTypes: defaultTickets
    });
  };

  const handleAddTicketType = (typeName) => {
    if (eventFormData.ticketTypes.some(t => t.name === typeName)) return;
    setEventFormData({
      ...eventFormData,
      ticketTypes: [
        ...eventFormData.ticketTypes,
        { name: typeName, price: 10000, quantityAvailable: 50 }
      ]
    });
  };

  const handleRemoveTicketType = (index) => {
    if (eventFormData.ticketTypes.length <= 1) {
      alert("El evento debe tener al menos un tipo de entrada habilitado.");
      return;
    }
    const updated = eventFormData.ticketTypes.filter((_, i) => i !== index);
    setEventFormData({ ...eventFormData, ticketTypes: updated });
  };

  const handleTicketChange = (index, field, value) => {
    const updated = [...eventFormData.ticketTypes];
    updated[index][field] = field === 'price' ? parseFloat(value) || 0 : (field === 'quantityAvailable' ? parseInt(value, 10) || 1 : value);
    setEventFormData({ ...eventFormData, ticketTypes: updated });
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEventFormData({ ...eventFormData, imageUrl: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: eventFormData.title,
        description: eventFormData.description,
        date: eventFormData.date.length === 16 ? `${eventFormData.date}:00` : eventFormData.date,
        isStreaming: Boolean(eventFormData.isStreaming),
        streamingUrl: eventFormData.isStreaming ? eventFormData.streamingUrl : "",
        imageUrl: eventFormData.imageUrl || "",
        venue: {
          name: eventFormData.venue.name,
          address: eventFormData.venue.address || "Centro de Eventos Rosario",
          capacity: Number(eventFormData.venue.capacity) || 250
        },
        ticketTypes: eventFormData.ticketTypes
      };

      if (isEditingEvent) {
        await updateEvent(eventFormData.id, payload);
      } else {
        await createEvent(payload);
      }
      setShowEventModal(false);
      fetchData(); 
    } catch (error) {
      console.error("Error al guardar el evento:", error);
      alert("No se pudo guardar el evento: " + (error.message || "Error desconocido"));
    }
  };

  const handleOpenDeleteEventModal = (eventItem) => {
    setEventToDelete(eventItem);
    setShowDeleteEventModal(true);
  };

  const handleCloseDeleteEventModal = () => {
    setEventToDelete(null);
    setShowDeleteEventModal(false);
  };

  const handleConfirmDeleteEvent = async () => {
    if (!eventToDelete) return;
    const eventId = eventToDelete.id || eventToDelete.Id;

    try {
      await deleteEvent(eventId);
      setEvents(events.filter(e => (e.id || e.Id) !== eventId));
      handleCloseDeleteEventModal();
    } catch (error) {
      console.error("Error al eliminar evento:", error);
      alert("No se pudo eliminar el evento: " + error.message);
    }
  };

  const handleOpenEditUserModal = (user) => {
    setUserToEdit(user);
    
    let rawRole = user.role !== undefined ? user.role : user.Role;
    if (rawRole === 0 || String(rawRole).toLowerCase() === 'client' || String(rawRole).toLowerCase() === 'user') rawRole = 'User';
    if (rawRole === 1 || String(rawRole).toLowerCase() === 'organizer') rawRole = 'Organizer';
    if (rawRole === 2 || String(rawRole).toLowerCase() === 'superadmin' || String(rawRole).toLowerCase() === 'admin') rawRole = 'SuperAdmin';

    setUserFormData({
      firstName: user.firstName || user.FirstName || '',
      lastName: user.lastName || user.LastName || '',
      email: user.email || user.Email || '',
      phoneNumber: user.phoneNumber || user.PhoneNumber || user.phone || user.Phone || '3410000000',
      role: rawRole || 'User'
    });
    setShowEditUserModal(true);
  };

  const handleCloseEditUserModal = () => {
    setUserToEdit(null);
    setShowEditUserModal(false);
  };

const handleSaveUserChanges = async (e) => {
  e.preventDefault();
  if (!userToEdit) return;
  const userId = userToEdit.id || userToEdit.Id;

  let roleNumber = 0;
  if (userFormData.role === 'Organizer') roleNumber = 1;
  if (userFormData.role === 'SuperAdmin') roleNumber = 2;

  try {
    const payload = {
      firstName: userFormData.firstName,
      lastName: userFormData.lastName,
      email: userFormData.email,
      phoneNumber: userFormData.phoneNumber || "3410000000",
      role: roleNumber
    };

    await updateUser(userId, payload);
    setShowEditUserModal(false);
    fetchData(); 
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    alert("No se pudo actualizar el usuario: " + error.message);
  }
};

  const handleOpenDeleteUserModal = (user) => {
    setUserToDelete(user);
    setShowDeleteUserModal(true);
  };

  const handleCloseDeleteUserModal = () => {
    setUserToDelete(null);
    setShowDeleteUserModal(false);
  };

  const handleConfirmDeleteUser = async () => {
    if (!userToDelete) return;
    const userId = userToDelete.id || userToDelete.Id;

    try {
      await deleteUser(userId);
      setUsers(users.filter(u => (u.id || u.Id) !== userId));
      handleCloseDeleteUserModal();
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      alert("No se pudo eliminar el usuario: " + error.message);
    }
  };

  if (loading) {
    return (
      <div className="myevents-loading-screen">
        <div className="loading-card text-center p-5">
          <Spinner animation="border" variant="danger" style={{ width: '3rem', height: '3rem' }} className="mb-3" />
          <h4 className="text-white fw-semibold">Cargando panel de control...</h4>
          <p className="text-muted mb-0">Sincronizando base de datos global</p>
        </div>
      </div>
    );
  }

  return (
    <div className="myevents-wrapper">
      <Container className="py-5">
        
        <Card className="border-0 mb-4 p-4" style={{ background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(16px)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <Row className="align-items-center">
            <Col md={10} className="d-flex align-items-center gap-3">
              <div style={{ width: '60px', height: '60px', background: 'linear-gradient(135deg, #7209b7 0%, #3a0ca3 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: '#fff' }}>
                <FaShieldAlt />
              </div>
              <div>
                <span className="events-badge" style={{ background: 'rgba(114, 9, 183, 0.2)', color: '#b5179e', borderColor: 'rgba(114, 9, 183, 0.4)' }}>CONTROL TOTAL</span>
                <h3 className="text-white fw-bold mb-1 mt-1">Panel de Administración General</h3>
                <p className="text-muted mb-0">
                  Administra la cartelera global de eventos y gestiona los permisos de usuarios de la plataforma BIPASS.
                </p>
              </div>
            </Col>
          </Row>
        </Card>

        <Nav variant="pills" className="mb-4 gap-2">
          <Nav.Item>
            <Button 
              variant={activeTab === 'events' ? 'danger' : 'dark'}
              className={`d-flex align-items-center gap-2 px-4 py-2 fw-semibold ${activeTab === 'events' ? '' : 'text-muted border border-secondary'}`}
              onClick={() => setActiveTab('events')}
              style={activeTab === 'events' ? { background: 'linear-gradient(45deg, #ff416c, #ff4b2b)', border: 'none' } : {}}
            >
              <FaTicketAlt /> Gestión de Eventos ({events.length})
            </Button>
          </Nav.Item>
          <Nav.Item>
            <Button 
              variant={activeTab === 'users' ? 'danger' : 'dark'}
              className={`d-flex align-items-center gap-2 px-4 py-2 fw-semibold ${activeTab === 'users' ? '' : 'text-muted border border-secondary'}`}
              onClick={() => setActiveTab('users')}
              style={activeTab === 'users' ? { background: 'linear-gradient(45deg, #ff416c, #ff4b2b)', border: 'none' } : {}}
            >
              <FaUsers /> Gestión de Usuarios ({users.length})
            </Button>
          </Nav.Item>
        </Nav>

        {activeTab === 'events' && (
          <>
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
              <div>
                <h2 className="text-white fw-bold mb-1">Eventos Activos en el Sistema ({events.length})</h2>
                <p className="text-muted mb-0">Listado global sincronizado con la base de datos central.</p>
              </div>
              <Button 
                onClick={handleOpenCreateEventModal}
                className="d-flex align-items-center gap-2 px-4 py-2 fw-bold border-0 shadow"
                style={{ background: 'linear-gradient(45deg, #ff416c, #ff4b2b)', borderRadius: '12px' }}
              >
                <FaPlus /> Publicar Nuevo Evento
              </Button>
            </div>

            {events.length > 0 ? (
              <Row xs={1} md={2} lg={3} className="g-4">
                {events.map(event => {
                  const eventId = event.id || event.Id;
                  const eventName = event.name || event.Name || event.title || event.Title || 'Evento sin nombre';
                  const eventDate = event.date || event.Date;
                  const venueName = event.venueName || event.venue?.name || event.VenueName || 'Ubicación principal';
                  const eventImage = event.imageUrl || event.ImageUrl || event.image || event.Image;

                  return (
                    <Col key={eventId}>
                      <Card className="event-manage-card h-100 border-0 shadow-sm">
                        {eventImage && (
                          <div style={{ height: '160px', overflow: 'hidden', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
                            <img src={eventImage} alt={eventName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        )}
                        <Card.Body className="d-flex flex-column p-4">
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <span className="event-status-badge">GLOBAL</span>
                            <span className="event-id-tag">ID: #{eventId}</span>
                          </div>

                          <Card.Title className="event-card-title mb-3">{eventName}</Card.Title>

                          <div className="event-details-list flex-grow-1 mb-4">
                            <div className="detail-item">
                              <FaCalendarAlt className="detail-icon" />
                              <span>
                                {eventDate 
                                  ? new Date(eventDate).toLocaleDateString('es-AR', { dateStyle: 'long' }) 
                                  : 'Fecha a confirmar'}
                              </span>
                            </div>
                            <div className="detail-item">
                              <FaMapMarkerAlt className="detail-icon" />
                              <span>{venueName}</span>
                            </div>
                          </div>

                          <div className="pt-3 border-top border-secondary-subtle d-flex justify-content-end gap-2 mt-auto">
                            <Button 
                              variant="outline-warning" 
                              size="sm" 
                              className="px-3 fw-semibold" 
                              onClick={() => handleOpenEditEventModal(event)}
                              style={{ borderRadius: '8px' }}
                            >
                              <FaEdit className="me-1" /> Editar
                            </Button>
                            <Button variant="outline-danger" size="sm" className="btn-action-danger-glow" onClick={() => handleOpenDeleteEventModal(event)}>
                              <FaTrashAlt /> Eliminar
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            ) : (
              <div className="empty-events-glass text-center p-5 mx-auto" style={{ maxWidth: '600px' }}>
                <FaInfoCircle className="fs-1 text-danger mb-3" />
                <h4 className="text-white fw-semibold">No hay eventos en la plataforma</h4>
                <p className="text-muted mb-0">Actualmente el sistema no registra ningún evento creado.</p>
              </div>
            )}
          </>
        )}

        {activeTab === 'users' && (
          <>
            <div className="mb-4">
              <h2 className="text-white fw-bold">Base de Usuarios Registrados ({users.length})</h2>
              <p className="text-muted">Modifica roles o da de baja usuarios de la plataforma.</p>
            </div>

            <Card className="border-0 shadow-lg" style={{ background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(16px)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <Card.Body className="p-0">
                <div className="table-responsive">
                  <Table hover variant="dark" className="align-middle mb-0" style={{ backgroundColor: 'transparent' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                        <th className="ps-4 py-3 text-muted small text-uppercase">ID</th>
                        <th className="py-3 text-muted small text-uppercase">Nombre y Apellido</th>
                        <th className="py-3 text-muted small text-uppercase">Correo Electrónico</th>
                        <th className="py-3 text-muted small text-uppercase">Rol del Sistema</th>
                        <th className="text-end pe-4 py-3 text-muted small text-uppercase">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center py-5 text-muted">
                            No se encontraron usuarios registrados en el sistema.
                          </td>
                        </tr>
                      ) : (
                        users.map((usr) => {
                          const usrId = usr.id || usr.Id;
                          const usrName = `${usr.firstName || usr.FirstName || ''} ${usr.lastName || usr.LastName || ''}`;
                          const usrEmail = usr.email || usr.Email;
                          const rawRole = usr.role !== undefined ? usr.role : usr.Role;
                          const roleInfo = formatRole(rawRole);

                          return (
                            <tr key={usrId} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)', transition: 'background 0.2s' }}>
                              <td className="ps-4 text-muted small fw-mono">#{usrId}</td>
                              <td className="fw-semibold text-white">{usrName}</td>
                              <td className="text-muted">{usrEmail}</td>
                              <td>
                                <span className={`badge bg-${roleInfo.variant} bg-opacity-25 text-${roleInfo.variant} border border-${roleInfo.variant} border-opacity-25 px-3 py-2 fw-semibold`} style={{ borderRadius: '8px' }}>
                                  {roleInfo.label}
                                </span>
                              </td>
                              <td className="text-end pe-4">
                                <Button 
                                  size="sm" 
                                  variant="outline-warning" 
                                  className="me-2 px-3 fw-semibold" 
                                  onClick={() => handleOpenEditUserModal(usr)}
                                  style={{ borderRadius: '8px' }}
                                >
                                  <FaEdit className="me-1" /> Editar
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline-danger" 
                                  className="px-3" 
                                  onClick={() => handleOpenDeleteUserModal(usr)}
                                  style={{ borderRadius: '8px' }}
                                >
                                  <FaTrashAlt />
                                </Button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </>
        )}

        <Modal show={showEventModal} onHide={() => setShowEventModal(false)} centered contentClassName="dark-glass-modal" size="lg">
          <Modal.Header closeButton className="bg-dark text-white border-bottom border-secondary">
            <Modal.Title className="fw-bold">
              {isEditingEvent ? "Modificar Datos del Evento" : "Publicar Nuevo Evento (SysAdmin)"}
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSaveEvent}>
            <Modal.Body className="bg-dark text-white p-4" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
              <Form.Group className="mb-3">
                <Form.Label className="text-muted small fw-semibold text-uppercase">Título del Evento</Form.Label>
                <Form.Control
                  type="text"
                  value={eventFormData.title}
                  onChange={(e) => setEventFormData({ ...eventFormData, title: e.target.value })}
                  required
                  placeholder="Ej: Electronic Sunset Festival"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.15)', color: '#fff', borderRadius: '8px' }}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="text-muted small fw-semibold text-uppercase">Descripción</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={eventFormData.description}
                  onChange={(e) => setEventFormData({ ...eventFormData, description: e.target.value })}
                  placeholder="Detalles del line-up, horarios, etc."
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.15)', color: '#fff', borderRadius: '8px' }}
                />
              </Form.Group>

              <Row>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label className="text-muted small fw-semibold text-uppercase">Modalidad de Asistencia</Form.Label>
                    <div className="d-flex gap-2">
                      {['Presencial', 'Online', 'Hibrido'].map((mod) => (
                        <Button
                          key={mod}
                          type="button"
                          className={`btn-mode-selector flex-grow-1 ${eventFormData.modalityType === mod ? 'active' : ''}`}
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

                {(eventFormData.modalityType === 'Online' || eventFormData.modalityType === 'Hibrido') && (
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label className="text-muted small fw-semibold text-uppercase">Link de Transmisión (Streaming URL)</Form.Label>
                      <InputGroup className="custom-input-group">
                        <InputGroup.Text className="datetime-icon-bg"><FaVideo /></InputGroup.Text>
                        <Form.Control 
                          type="url" 
                          className="custom-form-input"
                          placeholder="https://youtube.com/live/..."
                          required={eventFormData.isStreaming}
                          value={eventFormData.streamingUrl}
                          onChange={(e) => setEventFormData({...eventFormData, streamingUrl: e.target.value})}
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>
                )}
              </Row>

              <Form.Group className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <Form.Label className="text-muted small fw-semibold text-uppercase mb-0">Imagen de Portada</Form.Label>
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
                    <InputGroup.Text className="datetime-icon-bg"><FaImage /></InputGroup.Text>
                    <Form.Control 
                      type="url" 
                      className="custom-form-input"
                      placeholder="https://ejemplo.com/imagen.jpg"
                      value={eventFormData.imageUrl}
                      onChange={(e) => setEventFormData({...eventFormData, imageUrl: e.target.value})}
                    />
                  </InputGroup>
                ) : (
                  <InputGroup className="custom-input-group">
                    <InputGroup.Text className="datetime-icon-bg"><FaFileUpload /></InputGroup.Text>
                    <Form.Control 
                      type="file" 
                      accept="image/*"
                      className="custom-form-input"
                      onChange={handleImageFileChange}
                    />
                  </InputGroup>
                )}

                {eventFormData.imageUrl && (
                  <div className="mt-2 text-center p-2 rounded" style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.1)' }}>
                    <small className="text-muted d-block mb-1">Vista previa:</small>
                    <img src={eventFormData.imageUrl} alt="Preview" style={{ maxHeight: '80px', borderRadius: '6px', objectFit: 'contain' }} />
                  </div>
                )}
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="text-muted small fw-semibold text-uppercase">Fecha y Hora</Form.Label>
                    <Form.Control
                      type="datetime-local"
                      value={eventFormData.date}
                      onChange={(e) => setEventFormData({ ...eventFormData, date: e.target.value })}
                      required
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.15)', color: '#fff', borderRadius: '8px' }}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="text-muted small fw-semibold text-uppercase">Nombre del Venue / Lugar</Form.Label>
                    <Form.Control
                      type="text"
                      value={eventFormData.venue?.name || ''}
                      onChange={(e) => setEventFormData({
                        ...eventFormData, 
                        venue: { ...eventFormData.venue, name: e.target.value }
                      })}
                      required
                      placeholder="Ej: Complejo Forest"
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.15)', color: '#fff', borderRadius: '8px' }}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <div className="p-3 rounded mb-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                  <span className="text-white fw-bold small"><FaTicketAlt className="me-2 text-warning" /> Tipos de Entradas y Precios</span>
                  <div className="d-flex gap-1 flex-wrap">
                    {eventFormData.modalityType !== 'Online' && (
                      <>
                        <Button size="sm" variant="outline-light" onClick={() => handleAddTicketType('General')}>+ General</Button>
                        <Button size="sm" variant="outline-light" onClick={() => handleAddTicketType('VIP')}>+ VIP</Button>
                        <Button size="sm" variant="outline-light" onClick={() => handleAddTicketType('Backstage')}>+ Backstage</Button>
                      </>
                    )}
                    {(eventFormData.modalityType === 'Online' || eventFormData.modalityType === 'Hibrido') && (
                      <>
                        <Button size="sm" variant="outline-info" onClick={() => handleAddTicketType('Streaming')}>+ Streaming</Button>
                        <Button size="sm" variant="outline-info" onClick={() => handleAddTicketType('All Access - Backstage')}>+ All Access</Button>
                      </>
                    )}
                  </div>
                </div>

                {eventFormData.ticketTypes.map((ticket, idx) => (
                  <div key={idx} className="p-2 mb-2 rounded d-flex align-items-center gap-2" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <Form.Control 
                      type="text"
                      className="custom-form-input form-control-sm text-white"
                      placeholder="Nombre"
                      value={ticket.name}
                      onChange={(e) => handleTicketChange(idx, 'name', e.target.value)}
                      style={{ maxWidth: '130px', backgroundColor: 'rgba(255,255,255,0.05)' }}
                      required
                    />
                    <InputGroup size="sm">
                      <InputGroup.Text className="bg-dark text-muted border-secondary"><FaDollarSign /></InputGroup.Text>
                      <Form.Control 
                        type="number"
                        min="0"
                        placeholder="Precio"
                        value={ticket.price}
                        onChange={(e) => handleTicketChange(idx, 'price', e.target.value)}
                        required
                        className="text-white"
                        style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                      />
                    </InputGroup>
                    <InputGroup size="sm">
                      <InputGroup.Text className="bg-dark text-muted border-secondary"><FaTicketAlt /></InputGroup.Text>
                      <Form.Control 
                        type="number"
                        min="1"
                        placeholder="Stock"
                        value={ticket.quantityAvailable}
                        onChange={(e) => handleTicketChange(idx, 'quantityAvailable', e.target.value)}
                        required
                        className="text-white"
                        style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                      />
                    </InputGroup>
                    <Button variant="outline-danger" size="sm" onClick={() => handleRemoveTicketType(idx)}>
                      <FaTrashAlt />
                    </Button>
                  </div>
                ))}
              </div>

            </Modal.Body>
            <Modal.Footer className="bg-dark border-top border-secondary py-3">
              <Button variant="outline-light" onClick={() => setShowEventModal(false)} className="px-4 rounded-pill">
                Cancelar
              </Button>
              <Button type="submit" className="border-0 px-4 fw-semibold rounded-pill" style={{ background: 'linear-gradient(45deg, #ff416c, #ff4b2b)' }}>
                {isEditingEvent ? "Guardar Cambios" : "Publicar Evento"}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        <Modal show={showDeleteEventModal} onHide={handleCloseDeleteEventModal} centered contentClassName="dark-glass-modal">
          <Modal.Header closeButton className="border-0 pb-0 bg-dark text-white">
            <Modal.Title className="fw-bold d-flex align-items-center gap-2">
              <FaExclamationTriangle className="text-danger" /> Moderación de Evento
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4 text-center bg-dark text-white">
            <p className="text-muted mb-2">Estás a punto de dar de baja el evento como administrador:</p>
            <h5 className="text-white fw-bold mb-3">{eventToDelete?.name || eventToDelete?.Name || eventToDelete?.title || eventToDelete?.Title}</h5>
            <p className="text-danger small mb-0">Esta acción aplicará un borrado lógico ocultándolo de la cartelera global.</p>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0 pb-4 justify-content-center gap-2 bg-dark">
            <Button variant="outline-light" onClick={handleCloseDeleteEventModal} className="px-4 rounded-pill">
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleConfirmDeleteEvent} className="px-4 fw-semibold rounded-pill">
              Sí, Dar de Baja
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal show={showDeleteUserModal} onHide={handleCloseDeleteUserModal} centered>
          <Modal.Header closeButton className="bg-dark text-white border-0 pb-0">
            <Modal.Title className="fw-bold d-flex align-items-center gap-2">
              <FaExclamationTriangle className="text-danger" /> Dar de Baja Usuario
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="bg-dark text-white p-4 text-center">
            <p className="text-muted mb-2">¿Estás seguro de eliminar permanentemente al usuario?</p>
            <h5 className="text-white fw-bold mb-3">
              {userToDelete?.firstName || userToDelete?.FirstName} {userToDelete?.lastName || userToDelete?.LastName}
            </h5>
            <p className="text-muted small mb-0">Correo: {userToDelete?.email || userToDelete?.Email}</p>
          </Modal.Body>
          <Modal.Footer className="bg-dark border-0 pt-0 pb-4 justify-content-center gap-2">
            <Button variant="outline-light" onClick={handleCloseDeleteUserModal} className="px-4 rounded-pill">
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleConfirmDeleteUser} className="px-4 fw-semibold rounded-pill">
              Sí, Eliminar Usuario
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal show={showEditUserModal} onHide={handleCloseEditUserModal} centered>
          <Modal.Header closeButton className="bg-dark text-white border-bottom border-secondary">
            <Modal.Title className="fw-bold">Modificar Usuario y Permisos</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSaveUserChanges}>
            <Modal.Body className="bg-dark text-white p-4">
              <Form.Group className="mb-3">
                <Form.Label className="text-muted small fw-semibold text-uppercase">Nombre</Form.Label>
                <Form.Control
                  type="text"
                  value={userFormData.firstName}
                  onChange={(e) => setUserFormData({ ...userFormData, firstName: e.target.value })}
                  required
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.15)', color: '#fff', borderRadius: '8px' }}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="text-muted small fw-semibold text-uppercase">Apellido</Form.Label>
                <Form.Control
                  type="text"
                  value={userFormData.lastName}
                  onChange={(e) => setUserFormData({ ...userFormData, lastName: e.target.value })}
                  required
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.15)', color: '#fff', borderRadius: '8px' }}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="text-muted small fw-semibold text-uppercase">Correo Electrónico</Form.Label>
                <Form.Control
                  type="email"
                  value={userFormData.email}
                  onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                  required
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.15)', color: '#fff', borderRadius: '8px' }}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="text-muted small fw-semibold text-uppercase">Teléfono</Form.Label>
                <Form.Control
                  type="text"
                  value={userFormData.phoneNumber}
                  onChange={(e) => setUserFormData({ ...userFormData, phoneNumber: e.target.value })}
                  required
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.15)', color: '#fff', borderRadius: '8px' }}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="text-muted small fw-semibold text-uppercase">Rol del Sistema</Form.Label>
                <Form.Select
                  value={userFormData.role}
                  onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
                  style={{ backgroundColor: 'rgba(20, 20, 30, 0.95)', borderColor: 'rgba(255, 255, 255, 0.15)', color: '#fff', borderRadius: '8px' }}
                >
                  <option value="Cliente" className="bg-dark text-white">Cliente</option>
                  <option value="Organizer" className="bg-dark text-white">Organizador</option>
                  <option value="SuperAdmin" className="bg-dark text-white">Super Administrador</option>
                </Form.Select>
              </Form.Group>
            </Modal.Body>
            <Modal.Footer className="bg-dark border-top border-secondary py-3">
              <Button variant="outline-light" onClick={handleCloseEditUserModal} className="px-4 rounded-pill">
                Cancelar
              </Button>
              <Button type="submit" className="border-0 px-4 fw-semibold rounded-pill" style={{ background: 'linear-gradient(45deg, #ff416c, #ff4b2b)' }}>
                Guardar Cambios
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

      </Container>
    </div>
  );
};

export default AdminEvents;