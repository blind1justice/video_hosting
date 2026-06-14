import React, { useContext, useState } from "react";
import Card from "react-bootstrap/Card";
import { Button, Container, Form, Alert } from "react-bootstrap";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { logIn, registration, confirm_email } from "../http/authAPI";
import { observer } from 'mobx-react-lite';
import { Context } from "..";


const Auth = observer(() => {
    const { user } = useContext(Context);
    const location = useLocation();
    const isLogin = location.pathname === '/login';
    const isRegister = location.pathname === '/register';
    const isConfirm = location.pathname === '/confirm';
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [login, setLogin] = useState('');
    const [confirmationCode, setConfirmationCode] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleRegistration = async () => {
        try {
            setError('');
            await registration(email, password, username);
            navigate('/confirm');
        } catch (e) {
            setError(e.response?.data?.detail || 'Ошибка регистрации');
        }
    };

    const handleConfirmation = async () => {
        try {
            setError('');
            const data = await confirm_email(confirmationCode);
            user.setUser(data);
            user.setIsAuth(true);
            localStorage.removeItem('email');
            navigate('/profile');
        } catch (e) {
            setError(e.response?.data?.detail || 'Неверный код подтверждения');
        }
    };

    const handleLogin = async () => {
        try {
            setError('');
            const data = await logIn(login, password);
            user.setUser(data);
            user.setIsAuth(true);
            navigate('/profile');
        } catch (e) {
            setError(e.response?.data?.detail || 'Ошибка авторизации');
        }
    };

    const handleSubmit = async () => {
        if (isLogin) {
            await handleLogin();
        } else if (isRegister) {
            await handleRegistration();
        } else if (isConfirm) {
            await handleConfirmation();
        }
    };

    if (isConfirm) {
        return (
            <Container 
                className="d-flex justify-content-center align-items-center"
                style={{height: window.innerHeight / 1.4}}
            >
                <Card style={{width: 500}} className="p-5">
                    <h2 className="m-auto">Подтверждение email</h2>
                    {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
                    <Form className="d-flex flex-column">
                        <Form.Group className="mt-2">
                            <Form.Label>Код подтверждения <span className="text-danger">*</span></Form.Label>
                            <Form.Control 
                                placeholder="Введите код из письма" 
                                value={confirmationCode}
                                onChange={e => setConfirmationCode(e.target.value)}
                            />
                            <Form.Text className="text-muted">
                                Мы отправили код подтверждения на ваш email
                            </Form.Text>
                        </Form.Group>
                        <div className="d-flex justify-content-between align-items-center mt-3">
                            <div>
                                <NavLink to={'/register'}>Назад к регистрации</NavLink>
                            </div>
                            <Button variant="outline-success" onClick={handleSubmit}>
                                Подтвердить
                            </Button>
                        </div>
                    </Form>
                </Card>
            </Container>
        );
    }

    return (
        <Container 
            className="d-flex justify-content-center align-items-center"
            style={{height: window.innerHeight / 1.4}}
        >
            <Card style={{width: 500}} className="p-5">
                <h2 className="m-auto">{isLogin ? "Авторизация" : "Регистрация"}</h2>
                {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
                <Form className="d-flex flex-column">
                    {isLogin ? (
                        <div>
                            <Form.Group className="mt-2">
                                <Form.Label>Email или логин <span className="text-danger">*</span></Form.Label>
                                <Form.Control 
                                    placeholder="Введите email или логин" 
                                    value={login}
                                    onChange={e => setLogin(e.target.value)}
                                />
                            </Form.Group>
                            <Form.Group className="mt-2">
                                <Form.Label>Пароль <span className="text-danger">*</span></Form.Label>
                                <Form.Control 
                                    placeholder="Введите пароль" 
                                    type="password" 
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                />
                            </Form.Group>
                        </div>
                    ) : (
                        <div>
                            <Form.Group className="mt-2">
                                <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                                <Form.Control 
                                    placeholder="Введите email" 
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                />
                            </Form.Group>
                            <Form.Group className="mt-2">
                                <Form.Label>Имя пользователя</Form.Label>
                                <Form.Control 
                                    placeholder="Введите username"
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                />
                            </Form.Group>
                            <Form.Group className="mt-2">
                                <Form.Label>Пароль <span className="text-danger">*</span></Form.Label>
                                <Form.Control 
                                    placeholder="Введите пароль" 
                                    type="password" 
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                />
                            </Form.Group>
                        </div>
                    )}
                    <div className="d-flex justify-content-between align-items-center mt-3">
                        {isLogin ?
                            <div>
                                Нет аккаунта? <NavLink to={'/register'}>Создать аккаунт</NavLink>
                            </div>
                        :
                            <div>
                                Есть аккаунт? <NavLink to={'/login'}>Войти</NavLink>
                            </div>
                        }
                        <Button variant="outline-success" onClick={handleSubmit}> 
                            {isLogin ? "Войти" : "Зарегистрироваться"}
                        </Button>
                    </div>
                </Form>
            </Card>
        </Container>
    );
});

export default Auth;
