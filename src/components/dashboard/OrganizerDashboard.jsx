import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Table, Modal, Form, Alert, Spinner, Nav } from "react-bootstrap";
import { FaPlus, FaEdit, FaTrash, FaUserShield, FaEnvelope, FaCalendarAlt, FaUsers, FaTicketAlt } from "react-icons/fa";
import { getMyProfile, getEvents, createEvent, updateEvent, deleteEvent, getUsers, updateUser, deleteUser } from "../../services/apiService";
import "./OrganizerDashboard.css";

const OrganizerDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [activeTab, setActiveTab] = useState("events");
  
  // Estados Modal Eventos
  const [showEventModal, setShowEventModal] = useState(false);
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const [currentEventId, setCurrentEventId] = useState(null);
  const [eventFormData, setEventFormData] = useState({
    title: "",
    description: "",
    date: "",
    price: "",
    imageUrl: ""
  });

  const [showUserModal, setShowUserModal] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [userFormData, setUserFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "Client"
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [profileData, eventsData, usersData] = await Promise.all([
        getMyProfile().catch(() => ({ firstName: "Administrador", lastName: "BIPASS", email: "admin@bipass.com", role: "Admin" })),
        getEvents().catch(() => []),
        getUsers().catch(() => [])
      ]);
      setProfile(profileData);
      
      const listaEventos = Array.isArray(eventsData) ? eventsData : (eventsData?.items || []);
      setEvents(listaEventos);

      const listaUsuarios = Array.isArray(usersData) ? usersData : (usersData?.items || []);
      setUsers(listaUsuarios);
    } catch (err) {
      setError("Error al cargar los datos del panel.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleShowCreateEvent = () => {
    setIsEditingEvent(false);
    setEventFormData({ title: "", description: "", date: "", price: "", imageUrl: "" });
    setShowEventModal(true);
  };

  const handleShowEditEvent = (event) => {
    setIsEditingEvent(true);
    setCurrentEventId(event.id || event.Id);
    setEventFormData({
      title: event.title || event.Title || event.name || event.Name || "",
      description: event.description || event.Description || "",
      date: event.date ? event.date.split("T")[0] : (event.Date ? event.Date.split("T")[0] : ""),
      price: event.price || event.Price || "",
      imageUrl: event.imageUrl || event.ImageUrl || event.image || event.Image || ""
    });
    setShowEventModal(true);
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    try {
      if (isEditingEvent) {
        await updateEvent(currentEventId, eventFormData);
      } else {
        await createEvent(eventFormData);
      }
      setShowEventModal(false);
      loadData();
    } catch (err) {
      alert("Error al guardar el evento: " + err.message);
    }
  };

  const handleDeleteEvent = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este evento?")) {
      try {
        await deleteEvent(id);
        loadData();
      } catch (err) {
        alert("Error al eliminar: " + err.message);
      }
    }
  };

  const handleShowEditUser = (user) => {
    setCurrentUserId(user.id || user.Id);
    setUserFormData({
      firstName: user.firstName || user.FirstName || "",
      lastName: user.lastName || user.LastName || "",
      email: user.email || user.Email || "",
      role: user.role || user.Role || "Client"
    });
    setShowUserModal(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      await updateUser(currentUserId, userFormData);
      setShowUserModal(false);
      loadData();
    } catch (err) {
      alert("Error al actualizar usuario: " + err.message);
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar o dar de baja este usuario?")) {
      try {
        await deleteUser(id);
        loadData();
      } catch (err) {
        alert("Error al eliminar usuario: " + err.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5" style={{ minHeight: "70vh", backgroundColor: "#0b0b0f" }}>
        <Spinner animation="border" variant="danger" style={{ width: "3.5rem", height: "3.5rem" }} />
        <p className="text-light mt-3 fw-bold">Cargando panel de administración...</p>
      </div>
    );
  }

  return (
    <Container className="py-4 organizer-dashboard" style={{ minHeight: "100vh" }}>
      {error && <Alert variant="danger">{error}</Alert>}

      {profile && (
        <Row className="mb-4">
          <Col md={12}>
            <Card className="profile-card shadow-lg glass-effect p-3 border-0">
              <Card.Body className="d-flex flex-column flex-md-row align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-3 mb-3 mb-md-0">
                  <div className="profile-avatar text-white rounded-circle d-flex align-items-center justify-content-center shadow">
                    <FaUserShield size={26} />
                  </div>
                  <div>
                    <h4 className="text-white mb-1 fw-bold">{profile.firstName || profile.Name || "Usuario"} {profile.lastName || ""}</h4>
                    <p className="text-muted mb-0 d-flex align-items-center gap-2">
                      <FaEnvelope size={13} /> {profile.email || profile.Email || "correo@bipass.com"}
                    </p>
                  </div>
                </div>
                <div className="text-md-end">
                  <span className="badge bg-warning text-dark px-3 py-2 fs-6 shadow-sm">
                    Rol: {profile.role || profile.Role || "Admin"}
                  </span>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      <Nav variant="pills" defaultActiveKey="events" className="mb-4 gap-2 custom-dashboard-tabs">
        <Nav.Item>
          <Nav.Link 
            eventKey="events" 
            active={activeTab === 'events'} 
            onClick={() => setActiveTab('events')}
            className={`d-flex align-items-center gap-2 px-4 py-2 fw-semibold ${activeTab === 'events' ? 'bg-danger text-white shadow' : 'bg-dark text-muted border border-secondary'}`}
          >
            <FaTicketAlt /> Gestión de Eventos ({events.length})
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link 
            eventKey="users" 
            active={activeTab === 'users'} 
            onClick={() => setActiveTab('users')}
            className={`d-flex align-items-center gap-2 px-4 py-2 fw-semibold ${activeTab === 'users' ? 'bg-danger text-white shadow' : 'bg-dark text-muted border border-secondary'}`}
          >
            <FaUsers /> Gestión de Usuarios ({users.length})
          </Nav.Link>
        </Nav.Item>
      </Nav>

      {activeTab === 'events' && (
        <>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="text-white fw-bold mb-0">Cartelera de Eventos</h3>
            <Button variant="danger" className="d-flex align-items-center gap-2 neon-btn shadow" onClick={handleShowCreateEvent}>
              <FaPlus /> Crear Nuevo Evento
            </Button>
          </div>

          <Card className="shadow-lg glass-effect border-0">
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table hover variant="dark" className="align-middle mb-0 custom-table">
                  <thead>
                    <tr>
                      <th className="ps-3">Imagen</th>
                      <th>Título</th>
                      <th>Fecha</th>
                      <th>Precio</th>
                      <th className="text-end pe-3">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-4 text-muted">
                          No tenés eventos creados todavía. ¡Creá el primero!
                        </td>
                      </tr>
                    ) : (
                      events.map((ev) => (
                        <tr key={ev.id || ev.Id}>
                          <td className="ps-3">
                            <img 
                              src={ev.imageUrl || ev.ImageUrl || ev.image || ev.Image || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=120&q=80"} 
                              alt={ev.title || ev.Title} 
                              className="event-thumbnail rounded shadow-sm"
                              style={{ width: "60px", height: "40px", objectFit: "cover" }}
                            />
                          </td>
                          <td className="fw-semibold text-white">{ev.title || ev.Title || ev.name || ev.Name}</td>
                          <td>
                            <span className="d-flex align-items-center gap-1 text-muted">
                              <FaCalendarAlt size={12} /> {ev.date || ev.Date ? (ev.date || ev.Date).split("T")[0] : "N/D"}
                            </span>
                          </td>
                          <td className="text-info fw-bold">${ev.price || ev.Price || 0}</td>
                          <td className="text-end pe-3">
                            <Button size="sm" variant="outline-warning" className="me-2" onClick={() => handleShowEditEvent(ev)}>
                              <FaEdit />
                            </Button>
                            <Button size="sm" variant="outline-danger" onClick={() => handleDeleteEvent(ev.id || ev.Id)}>
                              <FaTrash />
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </>
      )}

      {/* VISTA 2: GESTIÓN DE USUARIOS */}
      {activeTab === 'users' && (
        <>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="text-white fw-bold mb-0">Base de Usuarios Registrados</h3>
          </div>

          <Card className="shadow-lg glass-effect border-0">
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table hover variant="dark" className="align-middle mb-0 custom-table">
                  <thead>
                    <tr>
                      <th className="ps-3">ID</th>
                      <th>Nombre y Apellido</th>
                      <th>Correo Electrónico</th>
                      <th>Rol</th>
                      <th className="text-end pe-3">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-4 text-muted">
                          No se encontraron usuarios registrados en el sistema.
                        </td>
                      </tr>
                    ) : (
                      users.map((usr) => (
                        <tr key={usr.id || usr.Id}>
                          <td className="ps-3 text-muted small">#{usr.id || usr.Id}</td>
                          <td className="fw-semibold text-white">{(usr.firstName || usr.FirstName || "") + " " + (usr.lastName || usr.LastName || "")}</td>
                          <td className="text-muted">{usr.email || usr.Email}</td>
                          <td>
                            <span className={`badge ${((usr.role || usr.Role) === 'Admin') ? 'bg-danger' : ((usr.role || usr.Role) === 'Organizer') ? 'bg-warning text-dark' : 'bg-info text-dark'} px-2 py-1`}>
                              {usr.role || usr.Role || "Client"}
                            </span>
                          </td>
                          <td className="text-end pe-3">
                            <Button size="sm" variant="outline-warning" className="me-2" onClick={() => handleShowEditUser(usr)}>
                              <FaEdit /> Editar Rol
                            </Button>
                            <Button size="sm" variant="outline-danger" onClick={() => handleDeleteUser(usr.id || usr.Id)}>
                              <FaTrash />
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </>
      )}

      <Modal show={showEventModal} onHide={() => setShowEventModal(false)} centered className="custom-modal">
        <Modal.Header closeButton className="bg-dark text-white border-secondary">
          <Modal.Title>{isEditingEvent ? "Editar Evento" : "Crear Nuevo Evento"}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSaveEvent}>
          <Modal.Body className="bg-dark text-white">
            <Form.Group className="mb-3">
              <Form.Label>Título del Evento</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ej. Concierto de Rock"
                value={eventFormData.title}
                onChange={(e) => setEventFormData({ ...eventFormData, title: e.target.value })}
                required
                className="custom-input"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Detalles y beneficios del evento..."
                value={eventFormData.description}
                onChange={(e) => setEventFormData({ ...eventFormData, description: e.target.value })}
                required
                className="custom-input"
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Fecha</Form.Label>
                  <Form.Control
                    type="date"
                    value={eventFormData.date}
                    onChange={(e) => setEventFormData({ ...eventFormData, date: e.target.value })}
                    required
                    className="custom-input"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Precio ($)</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="0.00"
                    value={eventFormData.price}
                    onChange={(e) => setEventFormData({ ...eventFormData, price: e.target.value })}
                    required
                    className="custom-input"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>URL de la Imagen</Form.Label>
              <Form.Control
                type="text"
                placeholder="https://images.unsplash.com/..."
                value={eventFormData.imageUrl}
                onChange={(e) => setEventFormData({ ...eventFormData, imageUrl: e.target.value })}
                className="custom-input"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="bg-dark border-secondary">
            <Button variant="secondary" onClick={() => setShowEventModal(false)}>
              Cancelar
            </Button>
            <Button variant="danger" type="submit" className="neon-btn">
              {isEditingEvent ? "Guardar Cambios" : "Publicar Evento"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={showUserModal} onHide={() => setShowUserModal(false)} centered className="custom-modal">
        <Modal.Header closeButton className="bg-dark text-white border-secondary">
          <Modal.Title>Modificar Usuario y Permisos</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSaveUser}>
          <Modal.Body className="bg-dark text-white">
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                value={userFormData.firstName}
                onChange={(e) => setUserFormData({ ...userFormData, firstName: e.target.value })}
                required
                className="custom-input"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Apellido</Form.Label>
              <Form.Control
                type="text"
                value={userFormData.lastName}
                onChange={(e) => setUserFormData({ ...userFormData, lastName: e.target.value })}
                required
                className="custom-input"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Correo Electrónico</Form.Label>
              <Form.Control
                type="email"
                value={userFormData.email}
                onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                required
                className="custom-input"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Rol del Sistema</Form.Label>
              <Form.Select
                value={userFormData.role}
                onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
                className="custom-input bg-dark text-white"
              >
                <option value="Client">Client (Cliente)</option>
                <option value="Organizer">Organizer (Organizador)</option>
                <option value="Admin">Admin (Administrador)</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="bg-dark border-secondary">
            <Button variant="secondary" onClick={() => setShowUserModal(false)}>
              Cancelar
            </Button>
            <Button variant="danger" type="submit" className="neon-btn">
              Guardar Cambios de Usuario
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default OrganizerDashboard;