import { useState } from 'react';
import { Carousel, Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { FaCalendarAlt, FaMapMarkerAlt, FaTicketAlt, FaFire } from 'react-icons/fa';
import './HeroCarousels.css';

const MAIN_EVENTS = [
  {
    id: 101,
    title: 'El Kuelgue Mendoza',
    date: '14 DE NOVIEMBRE',
    location: 'AUDITORIO A. BUSTELO',
    image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=1200&q=80',
    category: 'CONCIERTO'
  },
  {
    id: 102,
    title: 'International Music Festival',
    date: '15 DE OCTUBRE',
    location: 'PARQUE INDEPENDENCIA, ROSARIO',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
    category: 'FESTIVAL'
  },
  {
    id: 103,
    title: 'Rock Legends Concert',
    date: '22 DE OCTUBRE',
    location: 'METROPOLITANO, ROSARIO',
    image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80',
    category: 'ROCK'
  }
];

const SUB_EVENTS = [
  { id: 1, title: 'Social Distortion', date: '08 OCT', img: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80' },
  { id: 2, title: 'Pastillas del Abuelo', date: '12 OCT', img: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&q=80' },
  { id: 3, title: 'Bandalos Chinos', date: '21 OCT', img: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&q=80' },
  { id: 4, title: 'Fiesta de disfraces', date: '31 OCT', img: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&q=80' },
  { id: 5, title: 'Fabulosos Cadillacs', date: '05 NOV', img: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=400&q=80' },
  { id: 6, title: 'I Hate Models', date: '18 NOV', img: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&q=80' },
];

const HeroCarousels = () => {
  const [indexMain, setIndexMain] = useState(0);

  const handleSelectMain = (selectedIndex) => {
    setIndexMain(selectedIndex);
  };

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
            {MAIN_EVENTS.map((event) => (
              <Carousel.Item key={event.id}>
                <div 
                  className="hero-banner-card" 
                  style={{ backgroundImage: `linear-gradient(to top, rgba(11, 15, 25, 0.95) 10%, rgba(11, 15, 25, 0.2) 60%), url(${event.image})` }}
                >
                  <div className="hero-banner-content">
                    <Badge className="category-pill mb-2">
                      <FaFire className="me-1" /> {event.category}
                    </Badge>
                    <h1 className="hero-event-title">{event.title}</h1>
                    
                    <div className="hero-event-meta d-flex flex-wrap gap-3 mb-3">
                      <span><FaCalendarAlt className="me-2 text-purple" />{event.date}</span>
                      <span><FaMapMarkerAlt className="me-2 text-cyan" />{event.location}</span>
                    </div>

                    <Button className="btn-buy-hero px-4 py-2">
                      <FaTicketAlt className="me-2" /> Comprar Entradas
                    </Button>
                  </div>
                </div>
              </Carousel.Item>
            ))}
          </Carousel>
        </div>

        <div className="sub-carousel-section">
          <h5 className="sub-carousel-title mb-3">
            <span className="live-dot"></span> Próximos Destacados
          </h5>

          <div className="sub-carousel-track">
            {SUB_EVENTS.map((item) => (
              <Card key={item.id} className="sub-event-card border-0">
                <div className="sub-card-img-wrapper">
                  <Card.Img src={item.img} alt={item.title} className="sub-card-img" />
                  <span className="sub-card-date">{item.date}</span>
                </div>
                <Card.Body className="p-2 text-center">
                  <Card.Title className="sub-card-title text-truncate mb-0">
                    {item.title}
                  </Card.Title>
                </Card.Body>
              </Card>
            ))}
          </div>
        </div>

      </Container>
    </div>
  );
};

export default HeroCarousels;