import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  FaArrowLeft, 
  FaTicketAlt, 
  FaShoppingCart, 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaPlus, 
  FaMinus,
  FaClock,
  FaExclamationTriangle,
  FaArrowRight
} from "react-icons/fa";
import { getEventById, getTicketTypesByEvent, createPaymentPreference } from "../../services/apiService";
import MercadoPagoStep from "./MercadoPagoStep";
import "./Checkout.css";

// ✅ Se actualizaron los IDs de fallback a 1 y 2 para coincidir con la base de datos
const TICKETS_FALLBACK = [
  { id: 1, name: "Entrada General", price: 12000, quantityAvailable: 50 },
  { id: 2, name: "Streaming", price: 5000, quantityAvailable: 20 }
];

const TEN_MINUTES_IN_SECONDS = 10 * 60;

const Checkout = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [eventData, setEventData] = useState(null);
  const [ticketTypes, setTicketTypes] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [preferenceId, setPreferenceId] = useState(null);

  // Temporizador
  const [timeLeft, setTimeLeft] = useState(TEN_MINUTES_IN_SECONDS);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (loading || isExpired) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsExpired(true);
          setError("El tiempo para completar la compra ha expirado.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, isExpired]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const parsePrice = (price) => {
    if (typeof price === 'number') return price;
    if (!price) return 0;
    const cleanStr = String(price).replace(/[^0-9.-]+/g, "");
    return parseFloat(cleanStr) || 0;
  };

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        let eventRes = null;
        try {
          const rawRes = await getEventById(id);
          eventRes = rawRes?.data || rawRes;
        } catch (apiErr) {
          console.warn("Error cargando evento:", apiErr.message);
        }

        if (!isMounted) return;

        setEventData(eventRes || {
          title: "Evento Seleccionado",
          date: new Date().toISOString(),
          location: "Rosario, Santa Fe",
          imageUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=crop"
        });

        let ticketsRes = [];
        try {
          const rawTickets = await getTicketTypesByEvent(id);
          ticketsRes = Array.isArray(rawTickets) ? rawTickets : (rawTickets?.items || rawTickets?.data || []);
        } catch (tErr) {
          console.warn("Error cargando entradas desde backend:", tErr.message);
        }

        // ✅ Mapeo flexible para capturar las respuestas reales del backend (.NET camelCase o PascalCase)
        const finalTickets = (ticketsRes && ticketsRes.length > 0) 
          ? ticketsRes.map(t => ({
              id: t.id ?? t.Id ?? t.ticketTypeId,
              name: t.name ?? t.Name ?? "Entrada",
              price: t.price ?? t.Price ?? 0,
              quantityAvailable: t.quantityAvailable ?? t.QuantityAvailable ?? t.stock ?? t.Stock ?? 50
            }))
          : TICKETS_FALLBACK;

        setTicketTypes(finalTickets);
        const initialQty = {};
        finalTickets.forEach(t => { initialQty[t.id] = 0; });
        setQuantities(initialQty);

      } catch (err) {
        if (isMounted) setError("Error al preparar la compra.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (id) fetchData();
    return () => { isMounted = false; };
  }, [id]);

  const handleIncrement = (ticketId, maxQty) => {
    if (isExpired) return;
    setQuantities(prev => ({ ...prev, [ticketId]: Math.min((prev[ticketId] || 0) + 1, maxQty) }));
  };

  const handleDecrement = (ticketId) => {
    if (isExpired) return;
    setQuantities(prev => ({ ...prev, [ticketId]: Math.max((prev[ticketId] || 0) - 1, 0) }));
  };

  const calculateTotal = () => {
    return ticketTypes.reduce((sum, t) => sum + (parsePrice(t.price) * (quantities[t.id] || 0)), 0);
  };

  const handleProceedToPayment = async () => {
    if (isExpired) return;
    setError("");

    const selectedItems = ticketTypes
      .filter(t => (quantities[t.id] || 0) > 0)
      .map(t => ({
        ticketTypeId: Number(t.id), // ✅ Asegura envío numérico entero
        quantity: quantities[t.id],
        unitPrice: parsePrice(t.price)
      }));

    if (selectedItems.length === 0) {
      setError("Debes seleccionar al menos una entrada.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await createPaymentPreference({
        totalAmount: calculateTotal(),
        items: selectedItems
      });

      setPreferenceId(res.preferenceId);
      setStep(2);
    } catch (err) {
      setError(err.message || "Error al conectar con Mercado Pago.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="checkout-loading"><div className="spinner"></div><p>Cargando checkout...</p></div>;

  return (
    <div className="checkout-container">
      <div className="checkout-wrapper">
        <button className="back-btn" onClick={() => navigate('/billboard')}>
          <FaArrowLeft /> Volver a Cartelera
        </button>

        <h1 className="checkout-title">Finalizar Compra</h1>

        {/* Banner de Temporizador */}
        <div className={`checkout-timer-banner ${timeLeft < 120 ? 'timer-warning' : ''} ${isExpired ? 'timer-expired' : ''}`}>
          <div className="timer-info">
            <FaClock className="timer-icon" />
            <span>{isExpired ? "El tiempo ha expirado." : "Tiempo restante para comprar:"}</span>
          </div>
          <div className="timer-clock">{formatTime(timeLeft)}</div>
        </div>

        {error && <div className="checkout-error-banner">{error}</div>}

        {step === 1 ? (
          <div className="checkout-grid">
            <div className="checkout-left">
              <div className="checkout-card">
                <h2><FaTicketAlt /> Selección de Entradas</h2>
                <div className="tickets-list">
                  {ticketTypes.map((ticket) => {
                    const qty = quantities[ticket.id] || 0;
                    return (
                      <div key={ticket.id} className="ticket-item">
                        <div className="ticket-info">
                          <h3>{ticket.name}</h3>
                          <p>Disponibles: {ticket.quantityAvailable}</p>
                          <div className="ticket-price">${parsePrice(ticket.price).toLocaleString('es-AR')} ARS</div>
                        </div>
                        <div className="quantity-control">
                          <button className="quantity-btn" onClick={() => handleDecrement(ticket.id)} disabled={qty <= 0 || isExpired}><FaMinus /></button>
                          <span className="quantity-display">{qty}</span>
                          <button className="quantity-btn" onClick={() => handleIncrement(ticket.id, ticket.quantityAvailable)} disabled={qty >= ticket.quantityAvailable || isExpired}><FaPlus /></button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="checkout-right">
              <div className="summary-card">
                <h3>Resumen de Compra</h3>
                <div className="summary-breakdown">
                  {ticketTypes.filter(t => (quantities[t.id] || 0) > 0).map(t => (
                    <div key={t.id} className="summary-row">
                      <span>{quantities[t.id]}x {t.name}</span>
                      <span>${(parsePrice(t.price) * quantities[t.id]).toLocaleString('es-AR')} ARS</span>
                    </div>
                  ))}
                  <div className="summary-row total">
                    <span>Total:</span>
                    <span className="total-amount">${calculateTotal().toLocaleString('es-AR')} ARS</span>
                  </div>
                </div>

                <button className="pay-btn" onClick={handleProceedToPayment} disabled={submitting || calculateTotal() === 0 || isExpired}>
                  <FaShoppingCart /> {submitting ? "Generando Pago..." : "Ir a Pagar"} <FaArrowRight />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <MercadoPagoStep 
            preferenceId={preferenceId} 
            totalAmount={calculateTotal()} 
            onBack={() => setStep(1)} 
          />
        )}
      </div>
    </div>
  );
};

export default Checkout;