import React, { useContext, useState, useEffect, useRef } from "react";
import { Context } from "..";
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Badge from 'react-bootstrap/Badge';
import { NavLink, useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { get_all_notifications, mark_all_as_read, mark_as_read } from "../http/notificationAPI";

const NavBar = observer(() => {
    const {user} = useContext(Context);
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);
    const pollingInterval = useRef(null);

    // Функция для форматирования времени
    const formatTime = (dateString) => {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        const diffInHours = Math.floor(diffInMinutes / 60);
        const diffInDays = Math.floor(diffInHours / 24);
        const diffInMonths = Math.floor(diffInDays / 30);
        const diffInYears = Math.floor(diffInDays / 365);

        // Сегодня
        if (diffInMinutes < 1) return 'Только что';
        if (diffInMinutes < 60) return `${diffInMinutes} мин назад`;
        
        // Сегодня в HH:MM
        if (diffInHours < 24 && date.getDate() === now.getDate()) {
            return `Сегодня в ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        }
        
        // Вчера
        if (diffInDays === 1) {
            return `Вчера в ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        }
        
        // Неделя
        if (diffInDays < 7) {
            const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
            return `${days[date.getDay()]} в ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        }
        
        // Месяц
        if (diffInDays < 30) {
            return `${diffInDays} дн назад`;
        }
        
        // Год
        if (diffInYears < 1) {
            return `${diffInMonths} мес назад`;
        }
        
        // Больше года
        return `${diffInYears} г назад`;
    };

    // Альтернативный вариант форматирования (полная дата)
    const formatFullDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Функция для извлечения ссылки из текста уведомления
    const extractLinkAndText = (text) => {
        const urlRegex = /(https?:\/\/[^\s]+)/;
        const match = text.match(urlRegex);
        
        if (match) {
            const url = match[0];
            const textWithoutUrl = text.replace(url, '').trim();
            const isInternalLink = url.includes('/videos/') || 
                                  url.includes('/profile/') || 
                                  url.includes('/channel/');
            
            return {
                text: textWithoutUrl,
                url: url,
                isInternalLink: isInternalLink
            };
        }
        
        return { text: text, url: null, isInternalLink: false };
    };

    // Подсчет непрочитанных уведомлений
    const updateUnreadCount = (notificationsList) => {
        const count = notificationsList.filter(n => !n.is_read).length;
        setUnreadCount(count);
    };

    // Загрузка уведомлений
    const fetchNotifications = async () => {
        if (!user.isAuth) return;
        
        try {
            const data = await get_all_notifications();
            // Сортируем уведомления по дате (новые сверху)
            const sortedData = [...data].sort((a, b) => 
                new Date(b.created_at) - new Date(a.created_at)
            );
            setNotifications(sortedData);
            updateUnreadCount(sortedData);
        } catch (error) {
            console.error("Ошибка загрузки уведомлений:", error);
        }
    };

    // Отметить все как прочитанные
    const handleMarkAllAsRead = async () => {
        try {
            await mark_all_as_read(user.user.id);
            const updatedNotifications = notifications.map(n => ({ ...n, is_read: true }));
            setNotifications(updatedNotifications);
            setUnreadCount(0);
        } catch (error) {
            console.error("Ошибка при отметке всех уведомлений:", error);
        }
    };

    // Отметить одно уведомление как прочитанное
    const handleMarkAsRead = async (id, event) => {
        event.stopPropagation();
        try {
            await mark_as_read(id);
            const updatedNotifications = notifications.map(n => 
                n.id === id ? { ...n, is_read: true } : n
            );
            setNotifications(updatedNotifications);
            updateUnreadCount(updatedNotifications);
        } catch (error) {
            console.error("Ошибка при отметке уведомления:", error);
        }
    };

    // Обработка клика по уведомлению
    const handleNotificationClick = (notification, event) => {
        if (event.target.closest('.mark-read-btn')) {
            return;
        }
        
        const { url, isInternalLink } = extractLinkAndText(notification.content);
        
        if (url && isInternalLink) {
            const path = new URL(url).pathname;
            navigate(path);
            setShowDropdown(false);
            
            if (!notification.is_read) {
                mark_as_read(notification.id).catch(console.error);
            }
        }
    };

    // Настройка polling
    useEffect(() => {
        if (user.isAuth) {
            fetchNotifications();
            pollingInterval.current = setInterval(() => {
                fetchNotifications();
            }, 5000);
        } else {
            setNotifications([]);
            setUnreadCount(0);
            if (pollingInterval.current) {
                clearInterval(pollingInterval.current);
                pollingInterval.current = null;
            }
        }

        return () => {
            if (pollingInterval.current) {
                clearInterval(pollingInterval.current);
            }
        };
    }, [user.isAuth]);

    const logOut = () => {
        user.setUser({});
        user.setIsAuth(false);
        localStorage.removeItem('token');
        setNotifications([]);
        setUnreadCount(0);
        if (pollingInterval.current) {
            clearInterval(pollingInterval.current);
            pollingInterval.current = null;
        }
    }

    return (
        <Navbar expand="lg" className="bg-body-tertiary">
          <Container fluid>
            <NavLink to={'/videos'} style={{textDecoration: "none"}}>
              <Navbar.Brand style={{color: "red"}}>FreeVideos</Navbar.Brand>
            </NavLink>
            <Navbar.Toggle aria-controls="navbarScroll" />
            <Navbar.Collapse id="navbarScroll">
              <Nav className="me-auto">
                {user.isAuth  &&
                  <NavLink 
                    to={'/preferences'}
                    style={{
                      textDecoration: "none",
                      padding: "2px 16px",
                      borderRadius: "4px",
                      display: "inline-flex",
                      alignItems: "center",
                      color: "black"
                    }}
                  >
                    Настройки
                  </NavLink>
                }
                {user.isAuth && (user.user.role === "MODERATOR" || user.user.role === "ADMIN") &&
                  <NavLink 
                    to={'/reports'}
                    style={{
                      textDecoration: "none",
                      padding: "2px 16px",
                      borderRadius: "4px",
                      display: "inline-flex",
                      alignItems: "center",
                      color: "black"
                    }}
                  >
                    Жалобы
                  </NavLink>
                }
              </Nav>

              <Form className="d-flex mx-auto">
                <Form.Control
                  type="search"
                  placeholder="Поиск"
                  className="me-2"
                  aria-label="Search"
                />
                <Button variant="outline-success">Поиск</Button>
              </Form>

              <Nav className="ms-auto">
                {user.isAuth ? 
                <>
                    <NavDropdown
                        title={
                            <span>
                                🔔 
                                {unreadCount > 0 && (
                                    <Badge pill bg="danger" style={{ fontSize: '0.7rem', marginLeft: '5px' }}>
                                        {unreadCount}
                                    </Badge>
                                )}
                            </span>
                        }
                        id="notifications-dropdown"
                        align="end"
                        show={showDropdown}
                        onToggle={(isOpen) => setShowDropdown(isOpen)}
                    >
                        <div style={{ width: '350px', maxHeight: '450px', display: 'flex', flexDirection: 'column' }}>
                            {notifications.length === 0 ? (
                                <div className="text-center p-3 text-muted">
                                    Нет уведомлений
                                </div>
                            ) : (
                                <>
                                    {unreadCount > 0 && (
                                        <div className="p-2 border-bottom">
                                            <Button 
                                                variant="outline-primary" 
                                                size="sm" 
                                                onClick={handleMarkAllAsRead}
                                                style={{ width: '100%', fontSize: '0.85rem' }}
                                            >
                                                Отметить все как прочитанные ({unreadCount})
                                            </Button>
                                        </div>
                                    )}
                                    
                                    <div style={{ flex: 1, overflowY: 'auto' }}>
                                        {notifications.map(notification => {
                                            const { text, url, isInternalLink } = extractLinkAndText(notification.content);
                                            
                                            return (
                                                <div 
                                                    key={notification.id}
                                                    className={`p-2 border-bottom ${!notification.is_read ? 'bg-light' : ''}`}
                                                    style={{ cursor: url && isInternalLink ? 'pointer' : 'default' }}
                                                    onClick={(e) => handleNotificationClick(notification, e)}
                                                >
                                                    <div className="d-flex justify-content-between align-items-start">
                                                        <div className="flex-grow-1 me-2">
                                                            {/* Текст уведомления */}
                                                            <p className="mb-1" style={{ fontSize: '0.9rem', wordBreak: 'break-word' }}>
                                                                {text}
                                                                {url && (
                                                                    <span>
                                                                        {" "}
                                                                        {isInternalLink ? (
                                                                            <a
                                                                                href={url}
                                                                                onClick={(e) => {
                                                                                    e.preventDefault();
                                                                                    e.stopPropagation();
                                                                                    const path = new URL(url).pathname;
                                                                                    navigate(path);
                                                                                    setShowDropdown(false);
                                                                                    if (!notification.is_read) {
                                                                                        mark_as_read(notification.id).catch(console.error);
                                                                                    }
                                                                                }}
                                                                                style={{
                                                                                    color: '#0d6efd',
                                                                                    textDecoration: 'underline'
                                                                                }}
                                                                            >
                                                                                ссылка
                                                                            </a>
                                                                        ) : (
                                                                            <a
                                                                                href={url}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                onClick={(e) => e.stopPropagation()}
                                                                                style={{
                                                                                    color: '#0d6efd',
                                                                                    textDecoration: 'underline'
                                                                                }}
                                                                            >
                                                                                ссылка
                                                                            </a>
                                                                        )}
                                                                    </span>
                                                                )}
                                                            </p>
                                                            
                                                            {/* Время уведомления и статус */}
                                                            <div className="d-flex justify-content-between align-items-center">
                                                                <small className="text-muted">
                                                                    {notification.created_at && (
                                                                        <span title={formatFullDate(notification.created_at)}>
                                                                            🕒 {formatTime(notification.created_at)}
                                                                        </span>
                                                                    )}
                                                                </small>
                                                                <small className="text-muted ms-2">
                                                                    {notification.is_read ? '✓ Прочитано' : '● Новое'}
                                                                </small>
                                                            </div>
                                                        </div>
                                                        
                                                        {!notification.is_read && (
                                                            <Button
                                                                className="mark-read-btn"
                                                                variant="link"
                                                                size="sm"
                                                                onClick={(e) => handleMarkAsRead(notification.id, e)}
                                                                style={{ 
                                                                    fontSize: '0.75rem', 
                                                                    padding: '2px 6px',
                                                                    textDecoration: 'none',
                                                                    whiteSpace: 'nowrap'
                                                                }}
                                                            >
                                                                Отметить
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </>
                            )}
                        </div>
                    </NavDropdown>

                    <NavLink to={'/profile'}>
                      <Button className="me-2">{user.user.username || user.user.email}</Button>
                    </NavLink>
                    <NavLink to={'/videos'}>
                      <Button variant="outline-danger" onClick={logOut}>Выйти</Button>
                    </NavLink>
                </>
                :
                <NavLink to={'/login'}>
                  <Button>
                    Авторизация
                  </Button>
                </NavLink>
                } 
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
    );
});

export default NavBar;
