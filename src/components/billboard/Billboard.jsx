import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, InputGroup, Form, Carousel, Alert, Badge } from 'react-bootstrap';
import { FaMapMarkerAlt, FaCalendarAlt, FaSearch, FaRedo, FaExclamationTriangle, FaTicketAlt, FaFire } from 'react-icons/fa';
import { getEvents } from '../../services/apiService';
import './Billboard.css';

const EVENTS_FALLBACK = [
  {
    id: 1,
    title: 'International Music Festival 2026',
    description: 'El festival de música más grande de la región con artistas internacionales.',
    date: '15 Octubre 2026',
    location: 'Parque Independencia, Rosario',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
    category: 'Festival',
    price: '$15.000'
  },
  {
    id: 2,
    title: 'Rock Legends Night',
    description: 'Reviví los mejores clásicos del rock en vivo con bandas tributo oficiales.',
    date: '22 Octubre 2026',
    location: 'Metropolitano, Rosario',
    image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80',
    category: 'Concierto',
    price: '$12.000'
  },
  {
    id: 3,
    title: 'Electronic Warehouse Party',
    description: 'Una noche inmersiva de techno y house con DJs de renombre mundial.',
    date: '05 Noviembre 2026',
    location: 'Lotus Club, Rosario',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
    category: 'Fiesta',
    price: '$8.500'
  },
  {
    id: 4,
    title: 'Urban Music Sunset',
    description: 'Trap, reggaeton y hip-hop al aire libre con vista al río.',
    date: '12 Noviembre 2026',
    location: 'La Florida, Rosario',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
    category: 'Urbano',
    price: '$10.000'
  }
];

const Billboard = ({ isAuthenticated }) => {
  const navigate = useNavigate();
  const [events, setEvents] = useState(EVENTS_FALLBACK);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const normalizarEvento = (e, index) => {
    let fechaFormateada = 'Fecha a confirmar';
    const rawDate = e.date || e.Date || e.dateTime || e.DateTime;
    if (rawDate) {
      const parsedDate = new Date(rawDate);
      if (!isNaN(parsedDate.getTime())) {
        fechaFormateada = parsedDate.toLocaleDateString('es-AR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      } else {
        fechaFormateada = rawDate;
      }
    }

    const rawPrice = e.price ?? e.Price;
    let priceFormatted = 'Consultar';
    if (rawPrice !== undefined && rawPrice !== null && rawPrice !== '') {
      const priceStr = String(rawPrice).trim();
      priceFormatted = priceStr.startsWith('$') ? priceStr : `$${priceStr}`;
    }

    return {
      id: e.id || e.Id || `evt-${index}-${Math.random()}`,
      title: e.title || e.Title || e.name || e.Name || 'Evento sin título',
      description: e.description || e.Description || 'Sin descripción disponible.',
      date: fechaFormateada,
      location: e.location || e.Location || 'Rosario, Santa Fe',
      image: e.image || e.Image || e.imageUrl || e.ImageUrl || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80',
      category: e.category || e.Category || 'Espectáculo',
      price: priceFormatted
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
        setEvents(EVENTS_FALLBACK);
      }
    } catch (err) {
      console.warn('Cargando eventos de respaldo:', err.message);
      setError('Servidor no disponible. Mostrando cartelera destacada de prueba.');
      setEvents(EVENTS_FALLBACK);
    } finally {
      setLoading(false);
    }
  };

  // Manejador del botón Comprar
  const handleBuy = (e, eventId) => {
  // 1. Evita que la página se recargue por comportamientos por defecto
  if (e && e.preventDefault) e.preventDefault();
  if (e && e.stopPropagation) e.stopPropagation();

  const targetPath = `/checkout/${eventId}`;
  
  if (!isAuthenticated) {
    // Si no está autenticado, redirige al Login guardando la ruta destino
    navigate('/login', { state: { from: targetPath } });
  } else {
    // Si está autenticado, navega directamente al checkout
    navigate(targetPath);
  }
  };

  const filteredEvents = events.filter(
    (e) =>
      (e.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (e.description || '').toLowerCase().includes(search.toLowerCase()) ||
      (e.location || '').toLowerCase().includes(search.toLowerCase())
  );

  const mainFeaturedEvents = events.slice(0, 3);
  const fastBannerEvents = events.length > 3 ? events.slice(3, 7) : events;

  if (loading) {
    return (
      <div className="billboard-loading-screen">
        <div className="spinner-border text-danger" role="status" style={{ width: '3.5rem', height: '3.5rem' }} />
        <p className="mt-3 text-light fw-bold">Cargando cartelera de Bipass...</p>
      </div>
    );
  }

  return (
    <div className="passline-billboard">
      
      {/* Banner de aviso si la API no respondió */}
      {error && (
        <Container className="pt-3">
          <Alert variant="dark" className="border-danger text-light bg-dark shadow-sm mb-0">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <FaExclamationTriangle className="text-warning me-2 fs-5" />
                <small>{error}</small>
              </div>
              <Button variant="outline-light" size="sm" onClick={loadEvents}>
                <FaRedo className="me-1" /> Sincronizar
              </Button>
            </div>
          </Alert>
        </Container>
      )}

      {/* 1. CARRUSEL PRINCIPAL HERO */}
      {mainFeaturedEvents.length > 0 && (
        <section className="hero-carousel-section pt-3">
          <Carousel interval={4000} controls={true} indicators={true} className="passline-hero-carousel">
            {mainFeaturedEvents.map((event) => (
              <Carousel.Item key={`hero-${event.id}`}>
                <div className="hero-slide-wrapper">
                  <img className="hero-slide-img" src={event.image} alt={event.title} />
                  <div className="hero-slide-overlay" />
                  <div className="hero-slide-caption">
                    <Container>
                      <Badge bg="danger" className="mb-2 px-3 py-2 fs-6 text-uppercase tracking-wider">
                        <FaFire className="me-1" /> Destacado VIP
                      </Badge>
                      <h1 className="hero-title">{event.title}</h1>
                      <p className="hero-subtitle d-none d-md-block">{event.description}</p>
                      <div className="hero-meta my-3">
                        <span className="me-4"><FaCalendarAlt className="text-danger me-2" />{event.date}</span>
                        <span><FaMapMarkerAlt className="text-danger me-2" />{event.location}</span>
                      </div>
                      <Button 
                        variant="danger" 
                        size="lg" 
                        className="fw-bold px-4 py-2 passline-btn"
                        onClick={() => handleBuy(event.id)}
                      >
                        <FaTicketAlt className="me-2" /> Comprar Entradas
                      </Button>
                    </Container>
                  </div>
                </div>
              </Carousel.Item>
            ))}
          </Carousel>
        </section>
      )}

      {/* 2. CARRUSEL RÁPIDO BANNER */}
      {fastBannerEvents.length > 0 && (
        <section className="fast-banner-section py-4">
          <Container>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <h5 className="section-subtitle text-uppercase tracking-wider text-light mb-0">
                🔥 Más buscados esta semana
              </h5>
              <small className="text-muted">Actualización en vivo</small>
            </div>
            
            <Carousel interval={2500} indicators={false} controls={false} className="fast-carousel shadow-sm">
              {fastBannerEvents.map((event) => (
                <Carousel.Item key={`fast-${event.id}`}>
                  <div className="fast-banner-card">
                    <img src={event.image} alt={event.title} className="fast-banner-img" />
                    <div className="fast-banner-content">
                      <div className="d-flex align-items-center justify-content-between">
                        <div>
                          <Badge bg="dark" className="border border-secondary mb-1">{event.category}</Badge>
                          <h4 className="fast-banner-title mb-0">{event.title}</h4>
                          <small className="text-light-50"><FaMapMarkerAlt className="me-1" />{event.location}</small>
                        </div>
                        <Button 
                          variant="light" 
                          size="sm" 
                          className="fw-bold px-3"
                          onClick={() => handleBuy(event.id)}
                        >
                          Ver Ticks
                        </Button>
                      </div>
                    </div>
                  </div>
                </Carousel.Item>
              ))}
            </Carousel>
          </Container>
        </section>
      )}

      {/* 3. BARRA DE BÚSQUEDA */}
      <section className="search-section py-3">
        <Container>
          <Row className="justify-content-center">
            <Col md={8} lg={6}>
              <InputGroup className="passline-search-group">
                <InputGroup.Text className="search-icon-box">
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Buscar por artista, evento o ciudad..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="search-input"
                />
              </InputGroup>
            </Col>
          </Row>
        </Container>
      </section>

      {/* 4. GRILLA DE EVENTOS */}
      <section className="events-grid-section py-4">
        <Container>
          <div className="d-flex align-items-center justify-content-between mb-4 border-bottom border-secondary pb-2">
            <h3 className="section-title text-white fw-bold mb-0">Cartelera General</h3>
            <span className="badge bg-secondary">{filteredEvents.length} Eventos disponibles</span>
          </div>

          {filteredEvents.length > 0 ? (
            <Row xs={1} sm={2} md={3} lg={4} className="g-4">
              {filteredEvents.map((event) => (
                <Col key={event.id}>
                  <Card className="passline-card h-100 border-0">
                    <div className="card-img-wrapper">
                      <Card.Img variant="top" src={event.image} alt={event.title} className="passline-card-img" />
                      <Badge bg="dark" className="category-badge">{event.category}</Badge>
                      <div className="price-tag">{event.price}</div>
                    </div>
                    
                    <Card.Body className="d-flex flex-column bg-dark text-white p-3">
                      <Card.Title className="fw-bold fs-6 mb-2 text-truncate" title={event.title}>
                        {event.title}
                      </Card.Title>
                      
                      <p className="card-description small text-muted flex-grow-1 mb-3">
                        {event.description}
                      </p>
                      
                      <div className="card-info-item small text-light-50 mb-1">
                        <FaCalendarAlt className="me-2 text-danger" />
                        <span>{event.date}</span>
                      </div>
                      
                      <div className="card-info-item small text-light-50 mb-3">
                        <FaMapMarkerAlt className="me-2 text-danger" />
                        <span className="text-truncate">{event.location}</span>
                      </div>

                      <Button 
                        variant="danger" 
                        className="w-100 fw-bold btn-buy mt-auto"
                        onClick={() => handleBuy(event.id)}
                      >
                        Comprar Entrada
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <div className="empty-results text-center py-5">
              <p className="text-muted fs-5">No se encontraron eventos que coincidan con tu búsqueda.</p>
            </div>
          )}
        </Container>
      </section>

    </div>
  );
};

export default Billboard;