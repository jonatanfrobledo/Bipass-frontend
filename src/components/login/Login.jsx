import { useRef, useState } from "react";
import { Button, Card, Col, Form, FormGroup, Row, Alert, Spinner } from "react-bootstrap";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Login.css';

const Login = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [errors, setErrors] = useState({ email: false, password: false });

    const emailRef = useRef(null);
    const passwordRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    // Capturamos la ruta previa enviada desde el ProtectedRoute o Billboard
    // Si no existe, por defecto enviamos a '/billboard'
    const from = location.state?.from?.pathname || location.state?.from || "/billboard";

    const handleChangeEmail = (event) => {
        setEmail(event.target.value);
        setErrorMessage('');
        setErrors(prev => ({ ...prev, email: false }));
    };

    const handleChangePassword = (event) => {
        setPassword(event.target.value);
        setErrorMessage('');
        setErrors(prev => ({ ...prev, password: false }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrorMessage('');

        if (!email) {
            emailRef.current?.focus();
            setErrors(prev => ({ ...prev, email: true }));
            return;
        }
        if (!password) {
            passwordRef.current?.focus();
            setErrors(prev => ({ ...prev, password: true }));
            return;
        }

        try {
            setLoading(true);
            if (onLogin) {
                await onLogin(email, password);
            }
            // Redirige a la URL guardada dinámicamente en lugar de hardcodear '/billboard'
            navigate(from, { replace: true });
        } catch (err) {
            console.error("Error al autenticar:", err);
            const msg = err?.response?.data?.message || err?.message || "Credenciales incorrectas o servidor no disponible.";
            setErrorMessage(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Row className="g-0 vh-100 login-wrapper">
            {/* Columna de Video de Fondo (Izquierda) */}
            <Col md={7} lg={8} className="d-none d-md-flex align-items-center justify-content-center bg-dark overflow-hidden position-relative">
                <video
                    src="/gifs/video.mp4"
                    alt="Video de fondo BIPASS"
                    className="login-video"
                    autoPlay
                    loop
                    muted
                    playsInline
                />
                <div className="video-overlay" />
            </Col>

            {/* Columna de Formulario (Derecha) */}
            <Col md={5} lg={4} className="d-flex align-items-center justify-content-center login-bg p-3">
                <Card className="login-card p-3 p-md-4 shadow-lg w-100">
                    <Card.Body>
                        <div className="text-center mb-4">
                            <h2 className="login-title">BIPASS</h2>
                            <p className="login-subtitle">Ingresá a tu cuenta para continuar</p>
                        </div>

                        {errorMessage && (
                            <Alert className="login-alert-danger py-2 small text-center mb-3">
                                {errorMessage}
                            </Alert>
                        )}

                        <Form onSubmit={handleSubmit}>
                            {/* Campo Email */}
                            <FormGroup className="mb-3">
                                <Form.Label className="input-label">Correo Electrónico</Form.Label>
                                <Form.Control
                                    className={`custom-input ${errors.email ? "input-error" : ""}`}
                                    type="email"
                                    placeholder="ejemplo@correo.com"
                                    onChange={handleChangeEmail}
                                    value={email}
                                    ref={emailRef}
                                    disabled={loading}
                                />
                                {errors.email && (
                                    <p className="error-text">Debe ingresar un email válido.</p>
                                )}
                            </FormGroup>

                            {/* Campo Contraseña */}
                            <FormGroup className="mb-4">
                                <Form.Label className="input-label">Contraseña</Form.Label>
                                <Form.Control
                                    className={`custom-input ${errors.password ? "input-error" : ""}`}
                                    type="password"
                                    placeholder="••••••••"
                                    onChange={handleChangePassword}
                                    value={password}
                                    ref={passwordRef}
                                    disabled={loading}
                                />
                                {errors.password && (
                                    <p className="error-text">Debe ingresar su contraseña.</p>
                                )}
                            </FormGroup>

                            {/* Botón Iniciar Sesión */}
                            <Button type="submit" disabled={loading} className="neon-btn w-100 mb-2">
                                {loading ? (
                                    <>
                                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                                        Iniciando sesión...
                                    </>
                                ) : (
                                    "INICIAR SESIÓN"
                                )}
                            </Button>
                        </Form>

                        <hr className="login-divider" />

                        {/* Link a Registro */}
                        <div className="text-center mb-3">
                            <p className="mb-0 login-link-text">
                                ¿No tienes una cuenta? <Link to="/register" className="neon-link">Regístrate</Link>
                            </p>
                        </div>

                        <hr className="login-divider" />

                        {/* Tiendas de Aplicaciones */}
                        <div className="text-center mt-3">
                            <p className="login-subtitle mb-2">Descarga la aplicación</p>
                            <div className="d-flex justify-content-center gap-2">
                                <Button
                                    as="a"
                                    href="#"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    size="sm"
                                    className="btn-app-download rounded-pill d-flex align-items-center gap-1 px-3"
                                >
                                    <i className="bi bi-google-play"></i> Android
                                </Button>
                                <Button
                                    as="a"
                                    href="#"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    size="sm"
                                    className="btn-app-download rounded-pill d-flex align-items-center gap-1 px-3"
                                >
                                    <i className="bi bi-apple"></i> iOS
                                </Button>
                            </div>
                        </div>
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    );
};

export default Login;