import { useState, useEffect } from "react";
import { Button, Spinner, Alert } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { FaArrowLeft, FaShieldAlt, FaExternalLinkAlt, FaCheckCircle, FaExclamationTriangle, FaClock } from "react-icons/fa";
import { approveOrder } from "../../services/apiService"; // Importamos la función que creamos en el apiService
import "./MercadoPagoStep.css";

const MercadoPagoStep = ({ preferenceId, totalAmount, onBack }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isWaitingForPayment, setIsWaitingForPayment] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null); // 'approved', 'rejected'
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const status = queryParams.get('status') || queryParams.get('collection_status');

    if (status === 'approved') {
      setPaymentResult('approved');
      setTimeout(() => {
        navigate('/mytickets?status=approved');
      }, 2000);
    } else if (status === 'rejected' || status === 'failure') {
      setPaymentResult('rejected');
    }
  }, [location, navigate]);

  const handleOpenMercadoPago = () => {
    if (!preferenceId) {
      alert("No se encontró el ID de preferencia de pago.");
      return;
    }

    setIsWaitingForPayment(true);
    setPaymentResult(null);

    const mpCheckoutUrl = `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=${preferenceId}`;
    window.open(mpCheckoutUrl, '_blank');
  };

  const handleVerifyPayment = async () => {
    try {
      setIsVerifying(true);
      setPaymentResult(null);

      const orderId = sessionStorage.getItem('current_order_id');

      if (!orderId) {
        throw new Error("No se encontró el ID de la orden activa en la sesión.");
      }

      await approveOrder(orderId);

  
      setPaymentResult('approved');
      
      // Limpiamos la referencia temporal de la orden actual
      sessionStorage.removeItem('current_order_id');

      setTimeout(() => {
        navigate('/mytickets?status=approved');
      }, 1500);

    } catch (err) {
      console.error("Error al verificar o aprobar el pago:", err);
      setPaymentResult('rejected');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="mp-step-container">
      <div className="mp-card-glass text-center">
        
        {paymentResult === 'approved' && (
          <Alert variant="success" className="mb-4 text-white border-0" style={{ background: 'rgba(25, 135, 84, 0.3)' }}>
            <FaCheckCircle size={32} className="text-success mb-2" />
            <h4 className="fw-bold">¡Pago Aprobado con Éxito!</h4>
            <p className="mb-0 small">Redirigiendo a tus e-Tickets...</p>
          </Alert>
        )}

        {paymentResult === 'rejected' && (
          <Alert variant="danger" className="mb-4 text-white border-0" style={{ background: 'rgba(220, 53, 69, 0.3)' }}>
            <FaExclamationTriangle size={32} className="text-danger mb-2" />
            <h4 className="fw-bold">No se pudo verificar el pago</h4>
            <p className="mb-0 small">Hubo un error al actualizar la orden en el servidor.</p>
          </Alert>
        )}

        {!paymentResult && (
          <>
            <div className="mb-3">
              <FaCheckCircle className="mp-icon-shield text-info" style={{ fontSize: "2.5rem" }} />
            </div>
            
            <h2 className="mp-title">
              {isWaitingForPayment ? "Esperando tu pago..." : "¡Preferencia generada!"}
            </h2>
            
            <p className="mp-subtitle">
              {isWaitingForPayment 
                ? "Completa la operación en la pestaña de Mercado Pago. Una vez finalizado, presiona verificar."
                : "Se abrirá una pestaña segura de Mercado Pago para procesar tu abono."}
            </p>
          </>
        )}

        <div className="mp-summary-box mb-4">
          <span>Monto total a abonar:</span>
          <strong>${Number(totalAmount || 0).toLocaleString('es-AR')} ARS</strong>
        </div>

        {!isWaitingForPayment ? (
          <div className="mp-wallet-wrapper">
            <Button 
              variant="primary" 
              size="lg" 
              onClick={handleOpenMercadoPago}
              className="w-100 fw-bold d-flex align-items-center justify-content-center gap-2 shadow py-3"
              style={{ backgroundColor: "#009ee3", border: "none", borderRadius: "12px" }}
            >
              <span>Pagar en Mercado Pago</span>
              <FaExternalLinkAlt size={14} />
            </Button>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3 mb-4">
            <div className="p-3 rounded border border-warning text-warning d-flex align-items-center justify-content-center gap-2" style={{ background: 'rgba(255, 193, 7, 0.1)' }}>
              <Spinner animation="border" size="sm" variant="warning" />
              <span className="fw-semibold">Proceso activo en otra pestaña...</span>
            </div>

            <div className="d-flex align-items-center justify-content-center gap-2 text-muted small">
              <FaClock className="text-warning" />
              <span>Esperando confirmación de pasarela</span>
            </div>
            
            <Button 
              variant="success" 
              size="lg" 
              onClick={handleVerifyPayment}
              disabled={isVerifying}
              className="w-100 fw-bold py-3 shadow"
              style={{ borderRadius: "12px" }}
            >
              {isVerifying ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Actualizando Base de Datos...
                </>
              ) : (
                "¡Ya pagué! Ver mis e-Tickets"
              )}
            </Button>

            <Button 
              variant="outline-light" 
              size="sm" 
              onClick={() => {
                setIsWaitingForPayment(false);
                setPaymentResult(null);
              }}
            >
              Reintentar / Volver a pagar
            </Button>
          </div>
        )}

        <div className="mp-security-footer my-3">
          <span><FaShieldAlt className="text-success" /> Encriptación SSL 256-bits</span>
          <span>Protección antifraude</span>
        </div>

        {!isWaitingForPayment && (
          <button className="mp-back-link" onClick={onBack}>
            <FaArrowLeft className="me-1" /> Volver a selección de entradas
          </button>
        )}
      </div>
    </div>
  );
};

export default MercadoPagoStep;