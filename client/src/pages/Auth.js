import React, { useContext, useState } from "react";
import Card from "react-bootstrap/Card";
import { Button, Container, Form } from "react-bootstrap";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { logIn, registration } from "../http/authAPI";
import { observer } from 'mobx-react-lite';
import { Context } from "..";


const Auth = observer(() => {
    const {user} = useContext(Context);
    const location = useLocation();
    const isLogin = location.pathname === '/login'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [login, setLogin] = useState('');
    const navigate = useNavigate();

    const click = async () => {
        try {
            let data;
            if (isLogin) {
                data = await logIn(login, password);
            } else {
                data = await registration(email, password, username);
            }
            user.setUser(data);
            user.setIsAuth(true);
            navigate('/profile')
        } catch (e) {
            alert(e.response.data.detail)
        }
    }

    return (
        <Container 
            className="d-flex justify-content-center align-items-center"
            style={{height: window.innerHeight / 1.4}}
        >
            <Card style={{width: 500}} className="p-5">
                <h2 className="m-auto">{isLogin ? "Авторизация" : "Регистрация"}</h2>
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
                        <Button variant="outline-success" onClick={click}> 
                            {isLogin ? "Войти" : "Создать аккаунт"}
                        </Button>
                    </div>
                </Form>
            </Card>
        </Container>
    )
});

export default Auth;
