import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Alert, Card, Container, InputGroup, Form, Dropdown, Row, Col } from 'react-bootstrap';
import { getTickets, testConnection } from '../../services/apiService'; 
import { 
  BsTicketFill, 
  BsFillCreditCardFill, 
  BsExclamationCircleFill, 
  BsSearch, 
  BsCheckCircleFill, 
  BsXCircleFill,
  BsTvFill,
  BsShieldCheck,
  BsArrowRepeat,
  BsLightningChargeFill,
  BsStarFill
} from 'react-icons/bs';
import { FaRedo, FaInfoCircle, FaExclamationTriangle } from 'react-icons/fa';
import './Dashboard.css';

// Configuración de las entradas permitidas comercialmente y sus colores asignados
const ENTRADAS_PERMITIDAS = [
  { nombre: 'general', color: '#7c3aed', modalidad: 'Presencial' },
  { nombre: 'vip', color: '#a78bfa', modalidad: 'Presencial' },
  { nombre: 'backstage', color: '#f59e0b', modalidad: 'Presencial' },
  { nombre: 'streaming', color: '#3b82f6', modalidad: 'Virtual' },
  { nombre: 'streaming | all access', color: '#06b6d4', modalidad: 'Virtual' }
];

const ENTRADAS_MOCK = [
  {
    id: 'mock-1',
    tipo: 'General',
    modalidad: 'Presencial',
    descripcion: 'Acceso estándar presencial al evento para disfrutar la experiencia en vivo.',
    cantidad: 150,
    color: '#7c3aed',
    precio: 50.0,
  },
  {
    id: 'mock-2',
    tipo: 'VIP',
    modalidad: 'Presencial',
    descripcion: 'Ubicación preferencial, acceso prioritario y beneficios exclusivos.',
    cantidad: 5,
    color: '#a78bfa',
    precio: 150.0,
  },
  {
    id: 'mock-3',
    tipo: 'Backstage',
    modalidad: 'Presencial',
    descripcion: 'Acceso completo tras bambalinas, meet & greet y catering exclusivo.',
    cantidad: 2,
    color: '#f59e0b',
    precio: 300.0,
  },
  {
    id: 'mock-4',
    tipo: 'Streaming',
    modalidad: 'Virtual',
    descripcion: 'Acceso online en vivo con múltiples cámaras y chat interactivo.',
    cantidad: 200,
    color: '#3b82f6',
    precio: 30.0,
  },
  {
    id: 'mock-5',
    tipo: 'Streaming | All Access',
    modalidad: 'Virtual',
    descripcion: 'Transmisión en directo HD + acceso a cámara backstage y retransmisión por 48 hs.',
    cantidad: 50,
    color: '#06b6d4',
    precio: 60.0,
  },
];

const Dashboard = ({ userName }) => {
  const navigate = useNavigate();
  const [entradas, setEntradas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [filtro, setFiltro] = useState('todas');
  const [busqueda, setBusqueda] = useState('');

  const parsePrice = (val) => {
    if (typeof val === 'number') return isNaN(val) ? 0 : val;
    if (!val) return 0;
    const cleaned = String(val).replace(/[^0-9.-]+/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  };

  const normalizarEntrada = (item, index) => {
    const tipoOriginal = item.tipo || item.type || item.Type || item.name || item.Name || '';
    const tipoClean = tipoOriginal.toLowerCase().trim();

    // Buscar si coincide con alguna de las entradas comerciales autorizadas
    const configEntrada = ENTRADAS_PERMITIDAS.find(p => p.nombre === tipoClean);

    if (!configEntrada) return null; // Si no es una de las 5, se descarta

    return {
      id: item.id || item.Id || `ticket-${index}`,
      tipo: tipoOriginal,
      modalidad: item.modalidad || item.modality || item.Modality || configEntrada.modalidad,
      descripcion: item.descripcion || item.description || item.Description || 'Sin descripción',
      cantidad: Number(item.cantidad ?? item.quantity ?? item.Quantity ?? 0),
      precio: parsePrice(item.precio ?? item.price ?? item.Price),
      color: configEntrada.color, // Color asignado según el tipo comercial
    };
  };

  const loadEntradas = async (isMounted = { current: true }) => {
    try {
      setLoading(true);
      setError(null);

      const data = await getTickets();
      const listaOriginal = Array.isArray(data) ? data : (data?.items || []);

      if (isMounted.current) {
        // Normaliza y FILTRA únicamente las entradas permitidas
        const listaFiltrada = listaOriginal
          .map((item, index) => normalizarEntrada(item, index))
          .filter(Boolean); // Elimina los nulos

        if (listaFiltrada.length > 0) {
          setEntradas(listaFiltrada);
        } else {
          // Si la API no trae esas entradas específicas, carga el MOCK oficial
          setEntradas(ENTRADAS_MOCK);
        }
      }
    } catch (err) {
      console.error('Error cargando entradas:', err);
      if (isMounted.current) {
        setError('No se pudo conectar al servidor. Mostrando catálogo oficial.');
        setEntradas(ENTRADAS_MOCK);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const isMounted = { current: true };
    loadEntradas(isMounted);

    return () => {
      isMounted.current = false;
    };
  }, []);

  const testBackendConnection = async () => {
    setTestResult('Probando conexión...');
    try {
      const response = await testConnection();
      if (response && (response.status === 200 || response.message)) {
        setTestResult('Conexión exitosa');
      } else {
        setTestResult('Falló la conexión');
      }
    } catch (err) {
      console.error('Error probando backend:', err);
      setTestResult(`Error: ${err.message}`);
    }
  };

  const getEstadoEntrada = (cantidad) => {
    if (cantidad <= 0) return { texto: 'Agotada', className: 'status-badge-out', icono: <FaExclamationTriangle /> };
    if (cantidad <= 10) return { texto: '¡Pocas unidades!', className: 'status-badge-warning', icono: <BsExclamationCircleFill /> };
    return { texto: 'Disponible', className: 'status-badge-success', icono: <BsTicketFill /> };
  };

  const entradasFiltradas = useMemo(() => {
    const termino = busqueda.toLowerCase().trim();

    return entradas
      .filter((e) => {
        const estado = getEstadoEntrada(e.cantidad);
        if (filtro === 'disponibles') return estado.texto === 'Disponible';
        if (filtro === 'agotadas') return estado.texto === 'Agotada';
        if (filtro === 'pocas_unidades') return estado.texto === '¡Pocas unidades!';
        if (filtro === 'fisicas') return e.modalidad.toLowerCase().includes('física') || e.modalidad.toLowerCase().includes('presencial');
        if (filtro === 'virtuales') return e.modalidad.toLowerCase().includes('virtual') || e.modalidad.toLowerCase().includes('streaming');
        return true;
      })
      .filter((e) => {
        if (!termino) return true;
        const textoTipo = (e.tipo || '').toLowerCase();
        const textoDesc = (e.descripcion || '').toLowerCase();
        return textoTipo.includes(termino) || textoDesc.includes(termino);
      });
  }, [entradas, filtro, busqueda]);

  if (loading) {
    return (
      <div className="dashboard-loading-screen">
        <div className="loading-card text-center p-5">
          <div className="spinner-border text-purple mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Cargando...</span>
          </div>
          <h4 className="text-white fw-semibold">Cargando la experiencia BIPASS...</h4>
          <p className="text-muted mb-0">Sincronizando catálogo de eventos en vivo</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      
      {/* --- HERO BANNER --- */}
      <section className="dashboard-hero-container mb-5">
        <video src="/gifs/Dashboard.mp4" autoPlay muted loop className="hero-video-bg" />
        <div className="hero-overlay">
          <div className="hero-content text-center">
            <div className="hero-badge-container mb-2">
              <span className="hero-badge">PLATAFORMA DE EVENTOS HÍBRIDA</span>
            </div>
            <h1 className="welcome-title">
              BIPASS {userName ? <span className="highlight-text">{userName.toUpperCase()}</span> : ''}
            </h1>
            <p className="welcome-subtitle">
              Viví los eventos como quieras: <strong>Presencial</strong> o <strong>Streaming</strong>
            </p>
            <div className="hero-cta-group mt-4 d-flex justify-content-center gap-3 flex-wrap">
              <a href="#catalogo" className="btn btn-primary btn-hero-cta">
                Tipos De Entradas Disponibles
              </a>
              <a href="#como-funciona" className="btn btn-outline-light btn-hero-secondary">
                ¿Cómo funciona?
              </a>
            </div>
          </div>
        </div>
      </section>

      <Container className="dashboard-content pb-5">

        {/* --- SECCIÓN 1: MODALIDADES Y PROPUESTA DE VALOR --- */}
        <section id="como-funciona" className="modalities-section mb-5">
          <div className="text-center mb-4">
            <span className="text-purple-accent text-uppercase fw-bold tracking-wider">Dos Formas de Disfrutar</span>
            <h2 className="section-main-heading text-white mt-1">Elegí tu modalidad de acceso</h2>
            <p className="text-muted">Flexibilidad total adaptada a tus planes</p>
          </div>

          <Row className="g-4">
            {/* Tarjeta Modalidad Presencial */}
            <Col xs={12} md={6}>
              <div className="modality-card glass-card h-100 p-4">
                <div className="modality-icon-wrapper mb-3 text-purple">
                  <BsTicketFill size={38} />
                </div>
                <h3 className="text-white h4 fw-semibold mb-2">Entradas Presenciales</h3>
                <p className="text-muted">
                  Acceso directo a las instalaciones del evento. Elegí entre ubicaciones <strong>General</strong>, <strong>VIP</strong> o <strong>Backstage</strong> según la experiencia que busques.
                </p>
                <ul className="modality-features-list list-unstyled mt-3 mb-0 text-white-50">
                  <li><BsCheckCircleFill className="text-purple me-2" /> Entradas 100% digitales con QR seguro.</li>
                  <li><BsCheckCircleFill className="text-purple me-2" /> Opciones con beneficios exclusivos en recinto.</li>
                </ul>
              </div>
            </Col>

            {/* Tarjeta Modalidad Streaming */}
            <Col xs={12} md={6}>
              <div className="modality-card glass-card h-100 p-4">
                <div className="modality-icon-wrapper mb-3 text-cyan">
                  <BsTvFill size={38} />
                </div>
                <h3 className="text-white h4 fw-semibold mb-2">Streaming Virtual</h3>
                <p className="text-muted">
                  Transmisión en vivo en alta definición. Pensado para que disfrutes de tus artistas o conferencias favoritas con opciones <strong>Streaming</strong> o <strong>All Access</strong>.
                </p>
                <ul className="modality-features-list list-unstyled mt-3 mb-0 text-white-50">
                  <li><BsCheckCircleFill className="text-cyan me-2" /> Audio y video en alta calidad HD.</li>
                  <li><BsCheckCircleFill className="text-cyan me-2" /> Acceso instantáneo desde cualquier dispositivo.</li>
                </ul>
              </div>
            </Col>
          </Row>
        </section>

        {/* --- SECCIÓN 2: BENEFICIOS DE LA PLATAFORMA --- */}
        <section className="benefits-section mb-5">
          <div className="glass-panel p-4 p-md-5">
            <div className="row align-items-center g-4">
              <Col xs={12} lg={4}>
                <div className="benefits-header">
                  <span className="badge bg-purple-glow text-purple mb-2">BENEFICIOS BIPASS</span>
                  <h3 className="text-white fw-bold display-6">¿Por qué elegir nuestra plataforma?</h3>
                  <p className="text-muted mt-2">
                    Diseñamos un sistema pensado para que nunca te quedes afuera de una experiencia.
                  </p>
                </div>
              </Col>

              <Col xs={12} lg={8}>
                <Row className="g-3">
                  <Col xs={12} sm={6}>
                    <div className="benefit-item-card p-3">
                      <div className="benefit-icon mb-2 text-warning">
                        <BsArrowRepeat size={28} />
                      </div>
                      <h5 className="text-white fw-semibold mb-1">Garantía de Asistencia</h5>
                      <p className="text-muted small mb-0">
                        ¿Surgió un imprevisto y no podés asistir en persona? Cambiá o activá tu acceso virtual para ver el evento en vivo sin perderte nada.
                      </p>
                    </div>
                  </Col>

                  <Col xs={12} sm={6}>
                    <div className="benefit-item-card p-3">
                      <div className="benefit-icon mb-2 text-success">
                        <BsShieldCheck size={28} />
                      </div>
                      <h5 className="text-white fw-semibold mb-1">Cero Reventa Falsa</h5>
                      <p className="text-muted small mb-0">
                        Tickets vinculados a tu cuenta de usuario con validación en tiempo real.
                      </p>
                    </div>
                  </Col>

                  <Col xs={12} sm={6}>
                    <div className="benefit-item-card p-3">
                      <div className="benefit-icon mb-2 text-info">
                        <BsLightningChargeFill size={28} />
                      </div>
                      <h5 className="text-white fw-semibold mb-1">Confirmación Instantánea</h5>
                      <p className="text-muted small mb-0">
                        Comprás y tenés tu entrada habilitada en tu panel en cuestión de segundos.
                      </p>
                    </div>
                  </Col>

                  <Col xs={12} sm={6}>
                    <div className="benefit-item-card p-3">
                      <div className="benefit-icon mb-2 text-primary">
                        <BsStarFill size={28} />
                      </div>
                      <h5 className="text-white fw-semibold mb-1">Atención VIP</h5>
                      <p className="text-muted small mb-0">
                        Soporte técnico dedicado antes y durante las transmisiones en vivo.
                      </p>
                    </div>
                  </Col>
                </Row>
              </Col>
            </div>
          </div>
        </section>

        {/* --- SECCIÓN 3: CATÁLOGO DE ENTRADAS --- */}
        <section id="catalogo" className="catalog-section">
          
          <div className="section-header mb-4">
            <h2 className="section-title">ENTRADAS DISPONIBLES</h2>
            <div className="section-title-line"></div>
          </div>

          {/* --- Toolbar / Buscador y Filtros --- */}
          <div className="toolbar-glass mb-4 p-3 p-md-4">
            <div className="row g-3 align-items-center">
              
              {/* Buscador */}
              <div className="col-12 col-md-5">
                <InputGroup className="custom-input-group">
                  <InputGroup.Text className="input-icon-bg">
                    <BsSearch />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    className="custom-form-input"
                    placeholder="Buscar tipo de entrada o evento..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                  />
                </InputGroup>
              </div>

              {/* Filtro Dropdown */}
              <div className="col-6 col-md-4 col-lg-3">
                <Dropdown onSelect={(k) => setFiltro(k || 'todas')} className="w-100">
                  <Dropdown.Toggle className="custom-dropdown-toggle w-100 d-flex justify-content-between align-items-center">
                    <span>Filtro: <strong className="text-capitalize">{filtro.replace('_', ' ')}</strong></span>
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="custom-dropdown-menu">
                    <Dropdown.Item eventKey="todas">Todas las entradas</Dropdown.Item>
                    <Dropdown.Item eventKey="fisicas">Presenciales (Físicas)</Dropdown.Item>
                    <Dropdown.Item eventKey="virtuales">Streaming (Virtuales)</Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item eventKey="disponibles">Disponibles</Dropdown.Item>
                    <Dropdown.Item eventKey="pocas_unidades">Pocas unidades</Dropdown.Item>
                    <Dropdown.Item eventKey="agotadas">Agotadas</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>

              {/* Test Backend Button */}
              <div className="col-6 col-md-3 col-lg-4 d-flex align-items-center gap-2 justify-content-md-end">
                <Button variant="outline-light" className="btn-test-backend" onClick={testBackendConnection}>
                  Probar backend
                </Button>

                {testResult && (
                  <span className={`status-pill ${testResult.includes('exitosa') ? 'pill-success' : 'pill-error'}`}>
                    {testResult.includes('exitosa') ? <BsCheckCircleFill /> : <BsXCircleFill />}
                    <span className="d-none d-xl-inline">{testResult}</span>
                  </span>
                )}
              </div>

            </div>
          </div>

          {/* Mensaje de Advertencia si falla Backend */}
          {error && (
            <Alert className="custom-alert-glass mb-4">
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                <div className="d-flex align-items-center">
                  <FaExclamationTriangle className="text-warning fs-4 me-3" />
                  <div>
                    <strong className="text-white">Aviso del sistema:</strong>
                    <p className="mb-0 text-muted small">{error}</p>
                  </div>
                </div>
                <Button variant="link" className="btn-retry p-0 text-decoration-none" onClick={() => loadEntradas()}>
                  <FaRedo className="me-1" /> Reintentar
                </Button>
              </div>
            </Alert>
          )}

          {/* --- Grilla de Entradas --- */}
          <div className="row g-4">
            {entradasFiltradas.length > 0 ? (
              entradasFiltradas.map((entrada) => {
                const estado = getEstadoEntrada(entrada.cantidad);
                const esVirtual = entrada.modalidad.toLowerCase().includes('virtual') || entrada.modalidad.toLowerCase().includes('streaming');
                
                return (
                  <div key={entrada.id} className="col-12 col-md-6 col-lg-4 d-flex">
                    <Card className="entrada-card-v2 w-100 h-100 border-0">
                      
                      {/* Borde superior de color dinámico */}
                      <div className="card-top-accent" style={{ backgroundColor: entrada.color }}></div>

                      <Card.Body className="d-flex flex-column p-4">
                        
                        {/* Cabecera Tarjeta */}
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <h4 className="entrada-title mb-0" style={{ color: entrada.color }}>
                            {entrada.tipo}
                          </h4>
                          <span className={`status-badge ${estado.className}`}>
                            {estado.icono} <span>{estado.texto}</span>
                          </span>
                        </div>

                        {/* Modalidad */}
                        <div className="modalidad-tag mb-3 d-flex align-items-center">
                          <span className="text-muted me-2 small">Modalidad:</span>
                          <span className={`badge-modalidad ${esVirtual ? 'badge-virtual' : 'badge-fisica'}`}>
                            {esVirtual ? <BsTvFill className="me-1" /> : <BsTicketFill className="me-1" />}
                            {entrada.modalidad}
                          </span>
                        </div>

                        {/* Descripción */}
                        <Card.Text className="entrada-description flex-grow-1 mb-4">
                          {entrada.descripcion}
                        </Card.Text>

                        {/* Footer Tarjeta: Precio y Comprar */}
                        <div className="pt-3 border-top border-secondary-subtle d-flex justify-content-between align-items-center mt-auto">
                          <div>
                            <span className="price-label d-block text-muted">Precio</span>
                            <span className="price-value">${entrada.precio.toFixed(2)}</span>
                          </div>

                          <Button 
                            className="btn-buy-glass" 
                            disabled={entrada.cantidad <= 0}
                            onClick={() => navigate('/billboard')}
                            style={{
                              '--btn-accent': entrada.color
                            }}
                          >
                            <BsFillCreditCardFill className="me-2" /> Comprar
                          </Button>
                        </div>

                      </Card.Body>
                    </Card>
                  </div>
                );
              })
            ) : (
              <div className="col-12">
                <div className="empty-state-glass text-center p-5">
                  <FaInfoCircle className="fs-1 text-muted mb-3" />
                  <h4 className="text-white fw-semibold">No se encontraron resultados</h4>
                  <p className="text-muted mb-0">Intenta cambiar los filtros de búsqueda o el término ingresado.</p>
                </div>
              </div>
            )}
          </div>

        </section>

      </Container>
    </div>
  );
};

export default Dashboard;