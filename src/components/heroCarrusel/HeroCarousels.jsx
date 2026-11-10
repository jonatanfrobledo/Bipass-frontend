import { useState, useEffect } from 'react';
import { Carousel, Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { FaCalendarAlt, FaMapMarkerAlt, FaTicketAlt, FaFire } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { getEvents } from '../../services/apiService';
import './HeroCarousels.css';

const HeroCarousels = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [indexMain, setIndexMain] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHeroEvents = async () => {
      try {
        setLoading(true);
        const data = await getEvents();
        const eventList = Array.isArray(data) ? data : (data?.items || []);
        setEvents(eventList);
      } catch (error) {
        console.error("Error fetching hero events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHeroEvents();
  }, []);

  const handleSelectMain = (selectedIndex) => {
    setIndexMain(selectedIndex);
  };

  const mainEvents = events.slice(0, 3);
  const subEvents = events.slice(3, 9);

  if (loading || events.length === 0) {
    return (
      <div className="hero-section py-5 text-center">
        <Container>
          <div className="p-5 text-muted" style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '16px' }}>
            <h5 className="text-white">Cargando cartelera principal...</h5>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="hero-section">
      <Container fluid className="px-md-5 py-4">
        <div className="main-carousel-container mb-4">
          <Carousel 
            activeIndex={indexMain} 
            onSelect={handleSelectMain}
            interval={7000}
            fade
            indicators={true}
            className="main-hero-carousel"
          >
            {mainEvents.map((event) => {
              const eventId = event.id || event.Id;
              const eventTitle = event.name || event.Name || event.title || event.Title;
              const eventDate = event.date || event.Date;
              const venueName = event.venueName || event.venue?.name || event.VenueName || "Centro de Eventos Rosario";
              const eventImage = event.imageUrl || event.ImageUrl || event.image || 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=1200&q=80';
              const eventCategory = event.isStreaming ? "ONLINE / STREAMING" : "PRESENCIAL";

              return (
                <Carousel.Item key={eventId}>
                  <div 
                    className="hero-banner-card" 
                    style={{ backgroundImage: `linear-gradient(to top, rgba(11, 15, 25, 0.95) 10%, rgba(11, 15, 25, 0.2) 60%), url(${eventImage})` }}
                  >
                    <div className="hero-banner-content">
                      <Badge className="category-pill mb-2">
                        <FaFire className="me-1" /> {eventCategory}
                      </Badge>
                      <h1 className="hero-event-title">{eventTitle}</h1>
                      
                      <div className="hero-event-meta d-flex flex-wrap gap-3 mb-3">
                        <span>
                          <FaCalendarAlt className="me-2 text-purple" />
                          {eventDate ? new Date(eventDate).toLocaleDateString('es-AR', { dateStyle: 'long' }) : 'Fecha a confirmar'}
                        </span>
                        <span>
                          <FaMapMarkerAlt className="me-2 text-cyan" />
                          {venueName}
                        </span>
                      </div>

                      <Button 
                        className="btn-buy-hero px-4 py-2"
                        onClick={() => navigate(`/events/${eventId}`)}
                      >
                        <FaTicketAlt className="me-2" /> Comprar Entradas
                      </Button>
                    </div>
                  </div>
                </Carousel.Item>
              );
            })}
          </Carousel>
        </div>

        {subEvents.length > 0 && (
          <div className="sub-carousel-section">
            <h5 className="sub-carousel-title mb-3">
              <span className="live-dot"></span> Próximos Destacados
            </h5>

            <div className="sub-carousel-track">
              {subEvents.map((item) => {
                const subId = item.id || item.Id;
                const subTitle = item.name || item.Name || item.title || item.Title;
                const subDate = item.date || item.Date;
                const subImg = item.imageUrl || item.ImageUrl || item.image || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80';

                return (
                  <Card 
                    key={subId} 
                    className="sub-event-card border-0" 
                    onClick={() => navigate(`/events/${subId}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="sub-card-img-wrapper">
                      <Card.Img src={subImg} alt={subTitle} className="sub-card-img" />
                      <span className="sub-card-date">
                        {subDate ? new Date(subDate).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' }).toUpperCase() : 'PRONTO'}
                      </span>
                    </div>
                    <Card.Body className="p-2 text-center">
                      <Card.Title className="sub-card-title text-truncate mb-0">
                        {subTitle}
                      </Card.Title>
                    </Card.Body>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

      </Container>
    </div>
  );
};

export default HeroCarousels;