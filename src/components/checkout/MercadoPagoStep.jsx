import { useEffect } from 'react';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import { FaShieldAlt, FaCreditCard, FaLock } from 'react-icons/fa';
import './MercadoPagoStep.css';

initMercadoPago('YOUR_MERCADO_PAGO_PUBLIC_KEY', { locale: 'es-AR' });

const MercadoPagoStep = ({ preferenceId, totalAmount, onBack }) => {
  return (
    <div className="mp-step-container">
      <div className="mp-card-glass">
        <h3 className="mp-title">
          <FaShieldAlt className="mp-icon-shield" /> Pago Seguro con Mercado Pago
        </h3>
        <p className="mp-subtitle">
          Serás redirigido a la plataforma oficial para completar tu transacción de forma 100% protegida.
        </p>

        <div className="mp-summary-box">
          <span>Monto total a abonar:</span>
          <strong>${totalAmount.toLocaleString('es-AR')} ARS</strong>
        </div>

        <div className="mp-wallet-wrapper">
          {preferenceId ? (
            <Wallet 
              initialization={{ preferenceId: preferenceId, redirectMode: 'modal' }} 
              customization={{ texts: { valueProp: 'smart_option' } }}
            />
          ) : (
            <div className="mp-loading-btn">Generando botón de pago...</div>
          )}
        </div>

        <div className="mp-security-footer">
          <span><FaLock /> Encriptación de 256 bits</span>
          <span><FaCreditCard /> Múltiples medios de pago</span>
        </div>

        <button className="mp-back-link" onClick={onBack}>
          Modificar entradas seleccionadas
        </button>
      </div>
    </div>
  );
};

export default MercadoPagoStep;