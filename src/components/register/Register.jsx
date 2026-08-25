import { useRef, useState } from "react";
import { Button, Card, Col, Form, FormGroup, Row } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link, useNavigate } from 'react-router-dom';
import './Register.css'; // Importamos los estilos personalizados

const Register = ({ onRegister }) => {
    const navigate = useNavigate();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [birthdate, setBirthdate] = useState('');

    const [errors, setErrors] = useState({
        firstName: false,
        lastName: false,
        email: false,
        password: false,
        birthdate: false,
    });

    const firstNameRef = useRef(null);
    const lastNameRef = useRef(null);
    const emailRef = useRef(null);
    const passwordRef = useRef(null);
    const birthdateRef = useRef(null);

    const validatePassword = (pwd) => {
        const hasUpperCase = /[A-Z]/.test(pwd);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
        const isLongEnough = pwd.length >= 8;
        return hasUpperCase && hasSpecialChar && isLongEnough;
    };

    const handleChange = (setter, fieldName) => (event) => {
        setter(event.target.value);
        if (event.target.value) {
            setErrors(prevErrors => ({
                ...prevErrors,
                [fieldName]: false,
            }));
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        let formIsValid = true;
        const newErrors = {
            firstName: !firstName,
            lastName: !lastName,
            email: !email,
            password: !password,
            birthdate: !birthdate,
        };

        if (newErrors.firstName) {
            firstNameRef.current.focus();
            formIsValid = false;
        } else if (newErrors.lastName) {
            lastNameRef.current.focus();
            formIsValid = false;
        } else if (newErrors.email) {
            emailRef.current.focus();
            formIsValid = false;
        } else if (newErrors.password) {
            passwordRef.current.focus();
            formIsValid = false;
        } else if (newErrors.birthdate) {
            birthdateRef.current.focus();
            formIsValid = false;
        }

        if (password && !validatePassword(password)) {
            passwordRef.current.focus();
            newErrors.password = true;
            formIsValid = false;
        }

        setErrors(newErrors);

        if (formIsValid) {
            try {
                if (onRegister) {
                    await onRegister({ 
                        firstName, 
                        lastName, 
                        email, 
                        password, 
                        birthdate 
                    });
                }
                navigate('/billboard'); 
            } catch (error) {
                console.error("Error durante el registro:", error);
            }
        }
    };

    return (
        <Row className="g-0 vh-100 register-wrapper">
            {/* Sección de Video de Fondo */}
            <Col md={7} lg={8} className="d-none d-md-flex align-items-center justify-content-center bg-dark overflow-hidden position-relative">
                <video
                    src="/gifs/video.mp4"
                    alt="Video de fondo para registro"
                    className="register-video"
                    autoPlay
                    loop
                    muted
                />
                <div className="video-overlay"></div>
            </Col>

            {/* Sección de Formulario */}
            <Col md={5} lg={4} className="d-flex align-items-center justify-content-center register-bg p-3">
                <Card className="register-card p-3 shadow-lg">
                    <Card.Body>
                        <div className="text-center mb-4">
                            <h2 className="register-title">¡REGÍSTRATE EN BIPASS!</h2>
                            <p className="register-subtitle">Crea tu cuenta y vive la experiencia</p>
                        </div>

                        <Form onSubmit={handleSubmit}>
                            {/* Nombre y Apellido en 2 Columnas */}
                            <Row>
                                <Col sm={6}>
                                    <FormGroup className="mb-3">
                                        <Form.Label className="input-label">Nombre</Form.Label>
                                        <Form.Control
                                            className={`custom-input ${errors.firstName ? "input-error" : ""}`}
                                            type="text"
                                            name="firstName"
                                            placeholder="Ej: Jonatan"
                                            autoComplete="given-name"
                                            onChange={handleChange(setFirstName, "firstName")}
                                            value={firstName}
                                            ref={firstNameRef}
                                        />
                                        {errors.firstName && <p className="error-text">Obligatorio</p>}
                                    </FormGroup>
                                </Col>
                                <Col sm={6}>
                                    <FormGroup className="mb-3">
                                        <Form.Label className="input-label">Apellido</Form.Label>
                                        <Form.Control
                                            className={`custom-input ${errors.lastName ? "input-error" : ""}`}
                                            type="text"
                                            name="lastName"
                                            placeholder="Ej: Pérez"
                                            autoComplete="family-name"
                                            onChange={handleChange(setLastName, "lastName")}
                                            value={lastName}
                                            ref={lastNameRef}
                                        />
                                        {errors.lastName && <p className="error-text">Obligatorio</p>}
                                    </FormGroup>
                                </Col>
                            </Row>

                            {/* Campo Email */}
                            <FormGroup className="mb-3">
                                <Form.Label className="input-label">Correo Electrónico</Form.Label>
                                <Form.Control
                                    className={`custom-input ${errors.email ? "input-error" : ""}`}
                                    type="email"
                                    name="email"
                                    placeholder="ejemplo@correo.com"
                                    autoComplete="email"
                                    onChange={handleChange(setEmail, "email")}
                                    value={email}
                                    ref={emailRef}
                                />
                                {errors.email && <p className="error-text">Ingrese un correo válido</p>}
                            </FormGroup>

                            {/* Campo Contraseña */}
                            <FormGroup className="mb-3">
                                <Form.Label className="input-label">Contraseña</Form.Label>
                                <Form.Control
                                    className={`custom-input ${errors.password ? "input-error" : ""}`}
                                    type="password"
                                    name="password"
                                    placeholder="••••••••"
                                    autoComplete="new-password"
                                    onChange={handleChange(setPassword, "password")}
                                    value={password}
                                    ref={passwordRef}
                                />
                                {errors.password && (
                                    <p className="error-text">
                                        Min. 8 chars, 1 mayúscula y 1 caracter especial
                                    </p>
                                )}
                            </FormGroup>

                            {/* Campo Fecha de Nacimiento */}
                            <FormGroup className="mb-4">
                                <Form.Label className="input-label">Fecha de Nacimiento</Form.Label>
                                <Form.Control
                                    className={`custom-input date-input ${errors.birthdate ? "input-error" : ""}`}
                                    type="date"
                                    name="birthdate"
                                    onChange={handleChange(setBirthdate, "birthdate")}
                                    value={birthdate}
                                    ref={birthdateRef}
                                />
                                {errors.birthdate && <p className="error-text">Seleccione su fecha de nacimiento</p>}
                            </FormGroup>

                            {/* Botón Registrarse */}
                            <Button type="submit" className="neon-btn w-100 mb-3">
                                CREAR CUENTA
                            </Button>
                        </Form>

                        <hr className="register-divider" />

                        {/* Enlace Iniciar Sesión */}
                        <div className="text-center mt-3">
                            <p className="login-link-text mb-0">
                                ¿Ya tienes una cuenta? <Link to="/login" className="neon-link">Iniciar sesión</Link>
                            </p>
                        </div>
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    );
};

export default Register;