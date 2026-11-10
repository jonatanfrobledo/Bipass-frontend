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
  FaArrowRight
} from "react-icons/fa";
import { getEventById, getTicketTypesByEvent, createPaymentPreference } from "../../services/apiService";
import MercadoPagoStep from "./MercadoPagoStep";
import "./Checkout.css";

const TEN_MINUTES_IN_SECONDS = 10 * 60;

const Checkout = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [eventData, setEventData] = useState(null);
  const [ticketTypes, setTicketTypes] = useState([]);
  const [selectedQuantities, setSelectedQuantities] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [preferenceId, setPreferenceId] = useState(null);

  const [timeLeft, setTimeLeft] = useState(TEN_MINUTES_IN_SECONDS);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (isLoading || isExpired) return;

    const countdownTimer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(countdownTimer);
          setIsExpired(true);
          setErrorMessage("El tiempo para completar la compra ha expirado.");
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(countdownTimer);
  }, [isLoading, isExpired]);

  const formatTimerDisplay = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const parseItemPrice = (priceValue) => {
    if (typeof priceValue === 'number') return priceValue;
    if (!priceValue) return 0;
    const sanitizedString = String(priceValue).replace(/[^0-9.-]+/g, "");
    return parseFloat(sanitizedString) || 0;
  };

  useEffect(() => {
    let isComponentMounted = true;

    const fetchCheckoutData = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        let rawEvent = null;
        try {
          const response = await getEventById(id);
          rawEvent = response?.data || response?.result || response;
        } catch (apiError) {
          console.warn("No se pudo cargar el evento del backend:", apiError.message);
        }

        if (!isComponentMounted) return;

        if (rawEvent && typeof rawEvent === 'object') {
          setEventData({
            id: rawEvent.id || rawEvent.Id || id,
            title: rawEvent.title || rawEvent.Title || rawEvent.name || rawEvent.Name || "Evento Seleccionado",
            description: rawEvent.description || rawEvent.Description || "Sin descripción disponible.",
            date: rawEvent.date || rawEvent.Date || rawEvent.dateTime || rawEvent.DateTime || new Date().toISOString(),
            location: rawEvent.location || rawEvent.Location || rawEvent.venueName || rawEvent.venue?.name || "Rosario, Santa Fe",
            imageUrl: rawEvent.imageUrl || rawEvent.ImageUrl || rawEvent.image || rawEvent.Image || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=crop",
            price: rawEvent.price || rawEvent.Price || 0
          });
        } else {
          setEventData({
            id: id,
            title: "Evento #" + id,
            date: new Date().toISOString(),
            location: "Rosario, Santa Fe",
            imageUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=crop"
          });
        }

        let rawTickets = [];
        try {
          const ticketResponse = await getTicketTypesByEvent(id);
          rawTickets = Array.isArray(ticketResponse) ? ticketResponse : (ticketResponse?.items || ticketResponse?.data || ticketResponse?.result || []);
        } catch (ticketError) {
          console.warn("No se pudieron cargar las entradas desde el backend:", ticketError.message);
        }

        let finalTicketsList = [];
        if (rawTickets && rawTickets.length > 0) {
          finalTicketsList = rawTickets.map((ticket, index) => ({
            id: ticket.id ?? ticket.Id ?? ticket.ticketTypeId ?? index + 1,
            name: ticket.name ?? ticket.Name ?? ticket.title ?? ticket.Title ?? "Entrada General",
            price: ticket.price ?? ticket.Price ?? rawEvent?.price ?? rawEvent?.Price ?? 12000,
            quantityAvailable: ticket.quantityAvailable ?? ticket.QuantityAvailable ?? ticket.stock ?? ticket.Stock ?? 50
          }));
        } else {
          const baseEventPrice = rawEvent?.price ?? rawEvent?.Price ?? 12000;
          finalTicketsList = [
            { id: 1, name: "Entrada General", price: baseEventPrice, quantityAvailable: 50 },
            { id: 2, name: "Pase VIP", price: baseEventPrice * 1.5, quantityAvailable: 20 }
          ];
        }

        setTicketTypes(finalTicketsList);

        const initialQuantitiesMap = {};
        finalTicketsList.forEach(ticket => { initialQuantitiesMap[ticket.id] = 0; });
        setSelectedQuantities(initialQuantitiesMap);

      } catch (err) {
        if (isComponentMounted) setErrorMessage("Error al preparar la compra: " + err.message);
      } finally {
        if (isComponentMounted) setIsLoading(false);
      }
    };

    if (id) fetchCheckoutData();
    return () => { isComponentMounted = false; };
  }, [id]);

  const handleQuantityIncrement = (ticketId, maxStockQuantity) => {
    if (isExpired) return;
    setSelectedQuantities(prevQuantities => ({
      ...prevQuantities,
      [ticketId]: Math.min((prevQuantities[ticketId] || 0) + 1, maxStockQuantity)
    }));
  };

  const handleQuantityDecrement = (ticketId) => {
    if (isExpired) return;
    setSelectedQuantities(prevQuantities => ({
      ...prevQuantities,
      [ticketId]: Math.max((prevQuantities[ticketId] || 0) - 1, 0)
    }));
  };

  const calculateGrandTotal = () => {
    return ticketTypes.reduce((accumulator, ticket) => {
      const ticketQuantity = selectedQuantities[ticket.id] || 0;
      return accumulator + (parseItemPrice(ticket.price) * ticketQuantity);
    }, 0);
  };

  const handleProceedToPayment = async () => {
    if (isExpired) return;
    setErrorMessage("");

    const selectedItemsArray = ticketTypes
      .filter(ticket => (selectedQuantities[ticket.id] || 0) > 0)
      .map(ticket => ({
        ticketTypeId: Number(ticket.id), 
        quantity: selectedQuantities[ticket.id],
        unitPrice: parseItemPrice(ticket.price),
        ticketTypeName: ticket.name
      }));

    if (selectedItemsArray.length === 0) {
      setErrorMessage("Debes seleccionar al menos una entrada.");
      return;
    }

    try {
      setIsSubmitting(true);
      
      const payload = {
        totalAmount: calculateGrandTotal(),
        items: selectedItemsArray
      };

      const response = await createPaymentPreference(payload);

      const generatedPreferenceId = response.preferenceId || response.PreferenceId || response.id;
      const generatedOrderId = response.orderId || response.OrderId;

      if (!generatedPreferenceId) {
        throw new Error("No se pudo obtener el ID de preferencia de pago del servidor.");
      }

      if (generatedOrderId) {
        sessionStorage.setItem('current_order_id', generatedOrderId);

        const purchaseInfo = {
          title: eventData?.title || "Evento BIPASS",
          date: eventData?.date ? eventData.date.split("T")[0] : new Date().toISOString().split("T")[0],
          location: eventData?.location || "Rosario, Santa Fe",
          total: calculateGrandTotal(),
          items: selectedItemsArray
        };
        sessionStorage.setItem(`order_event_${generatedOrderId}`, JSON.stringify(purchaseInfo));
      }

      setPreferenceId(generatedPreferenceId);
      setCurrentStep(2);
    } catch (err) {
      setErrorMessage(err.message || "Error al conectar con Mercado Pago.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="checkout-loading">
        <div className="spinner"></div>
        <p>Cargando checkout...</p>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <div className="checkout-wrapper">
        <button className="back-btn" onClick={() => navigate('/billboard')}>
          <FaArrowLeft /> Volver a Cartelera
        </button>

        <h1 className="checkout-title">Finalizar Compra</h1>

        <div className={`checkout-timer-banner ${timeLeft < 120 ? 'timer-warning' : ''} ${isExpired ? 'timer-expired' : ''}`}>
          <div className="timer-info">
            <FaClock className="timer-icon" />
            <span>{isExpired ? "El tiempo ha expirado." : "Tiempo restante para comprar:"}</span>
          </div>
          <div className="timer-clock">{formatTimerDisplay(timeLeft)}</div>
        </div>

        {errorMessage && <div className="checkout-error-banner">{errorMessage}</div>}

        {currentStep === 1 ? (
          <div className="checkout-grid">
            <div className="checkout-left">
              <div className="checkout-card">
                <h2><FaTicketAlt /> Selección de Entradas</h2>
                <div className="tickets-list">
                  {ticketTypes.map((ticket) => {
                    const quantity = selectedQuantities[ticket.id] || 0;
                    return (
                      <div key={ticket.id} className="ticket-item">
                        <div className="ticket-info">
                          <h3>{ticket.name}</h3>
                          <p>Disponibles: {ticket.quantityAvailable}</p>
                          <div className="ticket-price">${parseItemPrice(ticket.price).toLocaleString('es-AR')} ARS</div>
                        </div>
                        <div className="quantity-control">
                          <button 
                            className="quantity-btn" 
                            onClick={() => handleQuantityDecrement(ticket.id)} 
                            disabled={quantity <= 0 || isExpired}
                          >
                            <FaMinus />
                          </button>
                          <span className="quantity-display">{quantity}</span>
                          <button 
                            className="quantity-btn" 
                            onClick={() => handleQuantityIncrement(ticket.id, ticket.quantityAvailable)} 
                            disabled={quantity >= ticket.quantityAvailable || isExpired}
                          >
                            <FaPlus />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="checkout-right">
              <div className="summary-card">
                {eventData && (
                  <div className="event-preview">
                    <img 
                      src={eventData.imageUrl} 
                      alt={eventData.title} 
                      className="event-image"
                    />
                    <div className="event-details">
                      <h3>{eventData.title}</h3>
                      <div className="event-meta">
                        <span>
                          <FaCalendarAlt className="text-warning" /> 
                          {eventData.date ? eventData.date.split("T")[0] : "Fecha a confirmar"}
                        </span>
                        <span>
                          <FaMapMarkerAlt className="text-danger" /> 
                          {eventData.location}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <h3>Resumen de Compra</h3>
                <div className="summary-breakdown">
                  {ticketTypes.filter(ticket => (selectedQuantities[ticket.id] || 0) > 0).map(ticket => (
                    <div key={ticket.id} className="summary-row">
                      <span>{selectedQuantities[ticket.id]}x {ticket.name}</span>
                      <span>${(parseItemPrice(ticket.price) * selectedQuantities[ticket.id]).toLocaleString('es-AR')} ARS</span>
                    </div>
                  ))}
                  <div className="summary-row total">
                    <span>Total:</span>
                    <span className="total-amount">${calculateGrandTotal().toLocaleString('es-AR')} ARS</span>
                  </div>
                </div>

                <button 
                  className="pay-btn" 
                  onClick={handleProceedToPayment} 
                  disabled={isSubmitting || calculateGrandTotal() === 0 || isExpired}
                >
                  <FaShoppingCart /> {isSubmitting ? "Generando Pago..." : "Ir a Pagar"} <FaArrowRight />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <MercadoPagoStep 
            preferenceId={preferenceId} 
            totalAmount={calculateGrandTotal()} 
            eventData={eventData}
            onBack={() => setCurrentStep(1)} 
          />
        )}
      </div>
    </div>
  );
};

export default Checkout;