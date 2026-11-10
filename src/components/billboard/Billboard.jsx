import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, InputGroup, Form, Carousel, Alert, Badge } from 'react-bootstrap';
import { 
  FaMapMarkerAlt, 
  FaSearch, 
  FaRedo, 
  FaExclamationTriangle, 
  FaTicketAlt, 
  FaFire,
  FaTv,
  FaVideo,
  FaChevronRight
} from 'react-icons/fa';
import { getEvents } from '../../services/apiService';
import './Billboard.css';

const EVENTS_FALLBACK = [
  {
    id: 1,
    title: 'MARO - SO MUCH HAS CHANGED',
    description: 'La destacada artista portuguesa presenta su nuevo tour internacional en vivo.',
    rawDate: '2026-11-12T19:00:00',
    location: 'C Art Media, Buenos Aires',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
    category: 'Concierto',
    price: '$15.000',
    isStreaming: false
  },
  {
    id: 2,
    title: 'El Kuelgue en San Juan',
    description: 'Presentación exclusiva repasando todos los grandes éxitos de su trayectoria.',
    rawDate: '2026-11-13T21:00:00',
    location: 'Complejo La Meseta, San Juan',
    image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80',
    category: 'Rock / Fusión',
    price: '$12.000',
    isStreaming: true,
    streamingUrl: 'https://youtube.com/live/demo'
  },
  {
    id: 3,
    title: 'Electronic Warehouse Night',
    description: 'Una noche inmersiva de techno y house con los DJs más destacados.',
    rawDate: '2026-11-13T19:00:00',
    location: 'Lotus Club, Rosario',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
    category: 'Fiesta',
    price: '$8.500',
    isStreaming: true
  },
  {
    id: 4,
    title: 'IVAN NOBLE - Canciones Traspapeladas',
    description: 'Noche acústica e íntima repasando grandes himnos del rock nacional.',
    rawDate: '2026-11-13T21:00:00',
    location: 'La Trastienda, Buenos Aires',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
    category: 'Acústico',
    price: '$10.000',
    isStreaming: false
  }
];

const Billboard = ({ isAuthenticated }) => {
  const navigate = useNavigate();
  const [events, setEvents] = useState(EVENTS_FALLBACK);
  const [search, setSearch] = useState('');
  const [filterModality, setFilterModality] = useState('todas');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const normalizarEvento = (e, index) => {
    const rawDate = e.date || e.Date || e.dateTime || e.DateTime || e.rawDate;
    let dayNum = '12';
    let monthShort = 'NOV';
    let yearNum = '2026';
    let timeStr = '20:00';

    if (rawDate) {
      const d = new Date(rawDate);
      if (!isNaN(d.getTime())) {
        dayNum = d.getDate().toString().padStart(2, '0');
        monthShort = d.toLocaleDateString('es-AR', { month: 'short' }).replace('.', '').toUpperCase();
        yearNum = d.getFullYear();
        timeStr = d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false });
      }
    }

    const isStream = Boolean(e.isStreaming || e.IsStreaming || e.streamingUrl || e.StreamingUrl);
    const hasVenue = Boolean(e.location || e.Location || e.venue?.name || e.venueName);
    
    let modalityTag = 'PRESENCIAL';
    if (isStream && hasVenue) modalityTag = 'HÍBRIDO';
    else if (isStream) modalityTag = 'STREAMING';

    const rawPrice = e.price ?? e.Price;
    let priceFormatted = 'Consultar';
    if (rawPrice !== undefined && rawPrice !== null && rawPrice !== '') {
      const priceStr = String(rawPrice).trim();
      priceFormatted = priceStr.startsWith('$') ? priceStr : `$${priceStr}`;
    }

    return {
      id: e.id || e.Id || `evt-${index}`,
      title: e.title || e.Title || e.name || e.Name || 'Evento BIPASS',
      description: e.description || e.Description || 'Sin descripción disponible.',
      dayNum,
      monthShort,
      yearNum,
      timeStr,
      location: e.location || e.Location || e.venue?.name || e.venueName || (isStream ? 'Transmisión Online' : 'Rosario, Argentina'),
      image: e.image || e.Image || e.imageUrl || e.ImageUrl || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80',
      category: e.category || e.Category || 'Espectáculo',
      price: priceFormatted,
      modalityTag
    };
  };

  const loadEvents = async () => {
    setLoading(true);
    setError(null);

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Tiempo de espera agotado al conectar con el servidor.')), 2500)
    );

    try {
      const data = await Promise.race([getEvents(), timeoutPromise]);
      const listaOriginal = Array.isArray(data) ? data : (data?.items || []);

      if (listaOriginal.length > 0) {
        setEvents(listaOriginal.map((item, index) => normalizarEvento(item, index)));
      } else {
        setEvents(EVENTS_FALLBACK.map((item, index) => normalizarEvento(item, index)));
      }
    } catch (err) {
      console.warn('Cargando eventos de respaldo:', err.message);
      setError('Servidor no disponible. Mostrando cartelera destacada de prueba.');
      setEvents(EVENTS_FALLBACK.map((item, index) => normalizarEvento(item, index)));
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = (eventId) => {
    if (!eventId) return;
    const targetPath = `/checkout/${eventId}`;
    if (!isAuthenticated) {
      navigate('/login', { state: { from: targetPath } });
    } else {
      navigate(targetPath);
    }
  };

  const filteredEvents = events.filter((e) => {
    const matchesSearch = (e.title || '').toLowerCase().includes(search.toLowerCase()) ||
                          (e.description || '').toLowerCase().includes(search.toLowerCase()) ||
                          (e.location || '').toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (filterModality === 'presencial') return e.modalityTag === 'PRESENCIAL';
    if (filterModality === 'streaming') return e.modalityTag === 'STREAMING';
    if (filterModality === 'hibrido') return e.modalityTag === 'HÍBRIDO';
    return true;
  });

  const mainFeaturedEvents = events.slice(0, 3);

  if (loading) {
    return (
      <div className="billboard-loading-screen">
        <div className="loading-card text-center p-5">
          <div className="spinner-border text-purple mb-3" role="status" style={{ width: '3.5rem', height: '3.5rem' }} />
          <h4 className="text-white fw-semibold">Sincronizando Cartelera BIPASS...</h4>
          <p className="text-muted mb-0">Cargando eventos presenciales y emisiones en streaming</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bipass-billboard-wrapper">
      
      {error && (
        <Container className="pt-4">
          <Alert className="custom-alert-glass mb-0">
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
              <div className="d-flex align-items-center">
                <FaExclamationTriangle className="text-warning fs-4 me-3" />
                <div>
                  <strong className="text-white">Aviso del sistema:</strong>
                  <p className="mb-0 text-muted small">{error}</p>
                </div>
              </div>
              <Button variant="link" className="btn-retry p-0 text-decoration-none" onClick={loadEvents}>
                <FaRedo className="me-1" /> Reintentar
              </Button>
            </div>
          </Alert>
        </Container>
      )}

      {mainFeaturedEvents.length > 0 && (
        <section className="hero-carousel-section pt-4">
          <Container>
            <Carousel interval={4500} controls={true} indicators={true} className="bipass-hero-carousel">
              {mainFeaturedEvents.map((event) => (
                <Carousel.Item key={`hero-${event.id}`}>
                  <div className="hero-slide-wrapper">
                    <img className="hero-slide-img" src={event.image} alt={event.title} />
                    <div className="hero-slide-overlay" />
                    <div className="hero-slide-caption">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <span className="hero-badge-fire">
                          <FaFire className="me-1" /> DESTACADO BIPASS
                        </span>
                        <span className={`modality-pill pill-${event.modalityTag.toLowerCase()}`}>
                          {event.modalityTag === 'STREAMING' && <FaTv className="me-1" />}
                          {event.modalityTag === 'HÍBRIDO' && <FaVideo className="me-1" />}
                          {event.modalityTag}
                        </span>
                      </div>

                      <h1 className="hero-title">{event.title}</h1>
                      <p className="hero-subtitle d-none d-md-block">{event.description}</p>
                      
                      <div className="hero-meta my-3">
                        <span className="me-4 text-white-50">
                          <strong className="text-purple me-1">{event.dayNum} {event.monthShort}</strong> - {event.timeStr} hs
                        </span>
                        <span className="text-white-50">
                          <FaMapMarkerAlt className="text-purple me-1" />{event.location}
                        </span>
                      </div>

                      <Button 
                        className="btn-hero-cta d-inline-flex align-items-center gap-2"
                        onClick={() => handleBuy(event.id)}
                      >
                        <FaTicketAlt /> Comprar Entradas
                      </Button>
                    </div>
                  </div>
                </Carousel.Item>
              ))}
            </Carousel>
          </Container>
        </section>
      )}

      <section className="search-section py-4">
        <Container>
          <div className="toolbar-glass p-3 p-md-4">
            <Row className="g-3 align-items-center">
              <Col md={6}>
                <InputGroup className="custom-input-group">
                  <InputGroup.Text className="input-icon-bg">
                    <FaSearch />
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Buscar por artista, show, lugar o ciudad..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="custom-form-input"
                  />
                </InputGroup>
              </Col>
              
              <Col md={6} className="d-flex gap-2 justify-content-md-end flex-wrap">
                <Button 
                  className={`btn-modality-filter ${filterModality === 'todas' ? 'active' : ''}`}
                  onClick={() => setFilterModality('todas')}
                >
                  Todas
                </Button>
                <Button 
                  className={`btn-modality-filter ${filterModality === 'presencial' ? 'active' : ''}`}
                  onClick={() => setFilterModality('presencial')}
                >
                  <FaMapMarkerAlt className="me-1" /> Presenciales
                </Button>
                <Button 
                  className={`btn-modality-filter filter-stream ${filterModality === 'streaming' ? 'active' : ''}`}
                  onClick={() => setFilterModality('streaming')}
                >
                  <FaTv className="me-1" /> Streaming
                </Button>
                <Button 
                  className={`btn-modality-filter filter-hibrido ${filterModality === 'hibrido' ? 'active' : ''}`}
                  onClick={() => setFilterModality('hibrido')}
                >
                  <FaVideo className="me-1" /> Híbridos
                </Button>
              </Col>
            </Row>
          </div>
        </Container>
      </section>

      <section className="events-grid-section pb-5">
        <Container>
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div>
              <span className="text-purple-accent text-uppercase fw-bold tracking-wider">Cartelera Oficial</span>
              <h2 className="section-main-heading text-white mt-1">Próximos Eventos</h2>
            </div>
            <span className="badge bg-purple-glow text-purple px-3 py-2 border border-purple-subtle">
              {filteredEvents.length} Disponibles
            </span>
          </div>

          {filteredEvents.length > 0 ? (
            <Row xs={1} sm={2} md={3} lg={4} className="g-4">
              {filteredEvents.map((event) => (
                <Col key={event.id}>
                  <Card 
                    className="passline-style-card border-0 h-100"
                    onClick={() => handleBuy(event.id)}
                  >
                    <div className="card-poster-wrapper">
                      <img src={event.image} alt={event.title} className="card-poster-img" />
                      
                      <span className={`card-modality-badge badge-${event.modalityTag.toLowerCase()}`}>
                        {event.modalityTag === 'STREAMING' && <FaTv className="me-1" />}
                        {event.modalityTag === 'HÍBRIDO' && <FaVideo className="me-1" />}
                        {event.modalityTag === 'PRESENCIAL' && <FaMapMarkerAlt className="me-1" />}
                        {event.modalityTag}
                      </span>

                      <div className="card-poster-overlay">
                        <span className="btn-quick-buy">
                          Comprar Ticket <FaChevronRight className="ms-1 fs-7" />
                        </span>
                      </div>
                    </div>

                    <Card.Body className="p-3 d-flex flex-column justify-content-between">
                      <div>
                        <div className="card-location-row mb-1">
                          <FaMapMarkerAlt className="location-icon" />
                          <span className="location-text">{event.location}</span>
                        </div>

                        <h3 className="event-passline-title mb-3" title={event.title}>
                          {event.title}
                        </h3>
                      </div>

                      <div className="event-date-footer">
                        <div className="date-block">
                          <span className="day-number">{event.dayNum}</span>
                          <div className="month-year-group">
                            <span className="month-text">{event.monthShort}</span>
                            <span className="year-text">{event.yearNum}</span>
                          </div>
                        </div>

                        <div className="time-divider" />

                        <div className="time-block">
                          <span className="time-number">{event.timeStr}</span>
                          <span className="time-unit">hrs</span>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <div className="empty-state-glass text-center p-5 mx-auto mt-4" style={{ maxWidth: '600px' }}>
              <FaTv className="fs-1 text-purple mb-3 opacity-50" />
              <h4 className="text-white fw-semibold">No encontramos eventos</h4>
              <p className="text-muted mb-0">Probá ajustando la búsqueda o el filtro de modalidad seleccionada.</p>
            </div>
          )}
        </Container>
      </section>

    </div>
  );
};

export default Billboard;