import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Form, Spinner } from "react-bootstrap";
import { get_me } from "../http/userAPI";
import { create_channel, update_channel, delete_channel } from "../http/channelAPI";
import { observer } from "mobx-react-lite";
import { NavLink } from "react-router-dom";
import VideoList from "../components/VideoList";

const Profile = observer(() => {
    const [loading, setLoading] = useState(true);
    
    // Отдельные состояния для пользователя
    const [userEmail, setUserEmail] = useState('');
    const [userUsername, setUserUsername] = useState('');
    const [userAvatarUrl, setUserAvatarUrl] = useState('');
    const [userCreatedAt, setUserCreatedAt] = useState('');
    
    // Отдельные состояния для канала
    const [channelId, setChannelId] = useState(null);
    const [channelDescription, setChannelDescription] = useState('');
    const [channelCountry, setChannelCountry] = useState('');
    const [channelLanguage, setChannelLanguage] = useState('');
    const [channelCreatedAt, setChannelCreatedAt] = useState('');
    const [subscriberCount, setSubscriberCount] = useState(0);
    
    // Формы для редактирования/создания
    const [formDescription, setFormDescription] = useState('');
    const [formCountry, setFormCountry] = useState('');
    const [formLanguage, setFormLanguage] = useState('');
    
    const [isEditing, setIsEditing] = useState(false);
    const [channelLoading, setChannelLoading] = useState(false);
    
    const hasChannel = !!channelId;

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const data = await get_me();
            console.log(data);
            if (data) {
                setUserEmail(data.email || '');
                setUserUsername(data.username || '');
                setUserAvatarUrl(data.avatar_url || '');
                setUserCreatedAt(data.created_at || '');
                
                if (data.channel) {
                    setChannelId(data.channel.id || null);
                    setChannelDescription(data.channel.description || '');
                    setChannelCountry(data.channel.country || '');
                    setChannelLanguage(data.channel.language || '');
                    setChannelCreatedAt(data.channel.created_at || '');

                    setFormDescription(data.channel.description || '');
                    setFormCountry(data.channel.country || '');
                    setFormLanguage(data.channel.language || '');
                    setSubscriberCount(data.channel.subscriber_count || 0);
                } else {
                    resetChannelData();
                }
            }
        } catch (error) {
            console.error('Ошибка при загрузке данных:', error);
        } finally {
            setLoading(false);
        }
    };
    
    const resetChannelData = () => {
        setChannelId(null);
        setChannelDescription('');
        setChannelCountry('');
        setChannelLanguage('');
        setChannelCreatedAt('');
        setFormDescription('');
        setFormCountry('');
        setFormLanguage('');
    };

    const formatNumber = (num) => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    };
    
    const resetForm = () => {
        setFormDescription(channelDescription);
        setFormCountry(channelCountry);
        setFormLanguage(channelLanguage);
    };

    const handleCreateChannel = async () => {
        try {
            setChannelLoading(true);
            const newChannel = await create_channel(
                formDescription,
                formCountry,
                formLanguage
            );

            setChannelId(newChannel.id || null);
            setChannelDescription(newChannel.description || '');
            setChannelCountry(newChannel.country || '');
            setChannelLanguage(newChannel.language || '');
            setChannelCreatedAt(newChannel.created_at || '');

            setFormDescription(newChannel.description || '');
            setFormCountry(newChannel.country || '');
            setFormLanguage(newChannel.language || '');
            
            setIsEditing(false);
        } catch (error) {
            console.error('Ошибка при создании канала:', error);
        } finally {
            setChannelLoading(false);
        }
    };
    
    const handleUpdateChannel = async () => {
        try {
            setChannelLoading(true);
            const updatedChannel = await update_channel(
                formDescription,
                formCountry,
                formLanguage
            );

            setChannelDescription(updatedChannel.description || '');
            setChannelCountry(updatedChannel.country || '');
            setChannelLanguage(updatedChannel.language || '');

            setFormDescription(updatedChannel.description || '');
            setFormCountry(updatedChannel.country || '');
            setFormLanguage(updatedChannel.language || '');
            
            setIsEditing(false);
        } catch (error) {
            console.error('Ошибка при обновлении канала:', error);
        } finally {
            setChannelLoading(false);
        }
    };

    const handleDeleteChannel = async () => {
        if (!window.confirm('Вы уверены, что хотите удалить канал? Это действие нельзя отменить.')) {
            return;
        }
        
        try {
            setChannelLoading(true);
            await delete_channel();
            resetChannelData();
        } catch (error) {
            console.error('Ошибка при удалении канала:', error);
        } finally {
            setChannelLoading(false);
        }
    };
    
    const handleCancelEdit = () => {
        resetForm();
        setIsEditing(false);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <Container className="mt-5 d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <div className="text-center">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3">Загрузка профиля...</p>
                </div>
            </Container>
        );
    }

    return (
        <Container className="mt-4">
            <h1 className="mb-4">{userUsername || userEmail}</h1>
            
            <Row>
                {/* Левая карточка: Информация о пользователе */}
                <Col md={6} className="mb-4">
                    <Card>
                        <Card.Header as="h5" className="bg-primary text-white">
                            Информация о пользователе
                        </Card.Header>
                        <Card.Body>
                            {userAvatarUrl && (
                                <div className="text-center mb-3">
                                    <img
                                        src={userAvatarUrl}
                                        alt="Аватар"
                                        className="rounded-circle"
                                        style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                    />
                                </div>
                            )}
                            
                            <Form>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Имя пользователя</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={userUsername}
                                        readOnly
                                        plaintext
                                    />
                                </Form.Group>
                                
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        value={userEmail}
                                        readOnly
                                        plaintext
                                    />
                                </Form.Group>
                                
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Дата регистрации</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formatDate(userCreatedAt)}
                                        readOnly
                                        plaintext
                                    />
                                </Form.Group>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
                
                {/* Правая карточка: Канал */}
                <Col md={6} className="mb-4">
                    <Card>
                        <Card.Header as="h5" className={hasChannel ? "bg-success text-white" : "bg-secondary text-white"}>
                            {hasChannel ? "Мой канал" : "Создание канала"}
                        </Card.Header>
                        
                        <Card.Body>
                            {hasChannel ? (
                                <>
                                    {isEditing ? (
                                        <Form>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Описание канала</Form.Label>
                                                <Form.Control
                                                    as="textarea"
                                                    rows={3}
                                                    value={formDescription}
                                                    onChange={(e) => setFormDescription(e.target.value)}
                                                    disabled={channelLoading}
                                                />
                                            </Form.Group>
                                            
                                            <Form.Group className="mb-3">
                                                <Form.Label>Страна</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={formCountry}
                                                    onChange={(e) => setFormCountry(e.target.value)}
                                                    disabled={channelLoading}
                                                />
                                            </Form.Group>
                                            
                                            <Form.Group className="mb-3">
                                                <Form.Label>Язык</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={formLanguage}
                                                    onChange={(e) => setFormLanguage(e.target.value)}
                                                    disabled={channelLoading}
                                                />
                                            </Form.Group>
                                            
                                            <div className="d-flex gap-2">
                                                <Button
                                                    variant="success"
                                                    onClick={handleUpdateChannel}
                                                    disabled={channelLoading}
                                                >
                                                    {channelLoading ? (
                                                        <Spinner animation="border" size="sm" />
                                                    ) : 'Сохранить'}
                                                </Button>
                                                
                                                <Button
                                                    variant="secondary"
                                                    onClick={handleCancelEdit}
                                                    disabled={channelLoading}
                                                >
                                                    Отмена
                                                </Button>
                                            </div>
                                        </Form>
                                    ) : (
                                        <>
                                            <Form>
                                                <Form.Group className="mb-3">
                                                    <Form.Label className="fw-bold">Описание:</Form.Label>
                                                    <p className="text-muted">
                                                        {channelDescription || 'Не указано'}
                                                    </p>
                                                </Form.Group>
                                                
                                                <Form.Group className="mb-3">
                                                    <Form.Label className="fw-bold">Страна:</Form.Label>
                                                    <p className="text-muted">
                                                        {channelCountry || 'Не указана'}
                                                    </p>
                                                </Form.Group>
                                                
                                                <Form.Group className="mb-3">
                                                    <Form.Label className="fw-bold">Язык:</Form.Label>
                                                    <p className="text-muted">
                                                        {channelLanguage || 'Не указан'}
                                                    </p>
                                                </Form.Group>
                                                
                                                <Form.Group className="mb-3">
                                                    <Form.Label className="fw-bold">Дата создания:</Form.Label>
                                                    <p className="text-muted">
                                                        {formatDate(channelCreatedAt)}
                                                    </p>
                                                </Form.Group>

                                                <Form.Group className="mb-3">
                                                    <Form.Label className="fw-bold">Количество подписчиков:</Form.Label>
                                                    <p className="text-muted">
                                                        {formatNumber(subscriberCount)}
                                                    </p>
                                                </Form.Group>

                                            </Form>
                                            
                                            <div className="d-flex gap-2">
                                                <NavLink to={'/upload-video'}>
                                                    <Button
                                                        variant="outline-primary"
                                                        >
                                                        Загрузить видео
                                                    </Button>
                                                </NavLink>

                                                <Button
                                                    variant="primary"
                                                    onClick={() => setIsEditing(true)}
                                                >
                                                    Редактировать
                                                </Button>
                                                
                                                <Button
                                                    variant="danger"
                                                    onClick={handleDeleteChannel}
                                                    disabled={channelLoading}
                                                >
                                                    {channelLoading ? (
                                                        <Spinner animation="border" size="sm" />
                                                    ) : 'Удалить канал'}
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </>
                            ) : (
                                <div>
                                    <p className="text-muted mb-4">
                                        У вас еще нет канала. Создайте канал, чтобы начать загружать видео.
                                    </p>
                                    
                                    <Form>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Описание канала</Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={3}
                                                placeholder="Расскажите о своем канале..."
                                                value={formDescription}
                                                onChange={(e) => setFormDescription(e.target.value)}
                                                disabled={channelLoading}
                                            />
                                        </Form.Group>
                                        
                                        <Form.Group className="mb-3">
                                            <Form.Label>Страна</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Например, Монголия"
                                                value={formCountry}
                                                onChange={(e) => setFormCountry(e.target.value)}
                                                disabled={channelLoading}
                                            />
                                        </Form.Group>
                                        
                                        <Form.Group className="mb-3">
                                            <Form.Label>Язык</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Например, Монгольский"
                                                value={formLanguage}
                                                onChange={(e) => setFormLanguage(e.target.value)}
                                                disabled={channelLoading}
                                            />
                                        </Form.Group>
                                        
                                        <Button
                                            variant="primary"
                                            onClick={handleCreateChannel}
                                            disabled={channelLoading}
                                            className="w-100"
                                        >
                                            {channelLoading ? (
                                                <>
                                                    <Spinner animation="border" size="sm" className="me-2" />
                                                    Создание...
                                                </>
                                            ) : 'Создать канал'}
                                        </Button>
                                    </Form>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            
            {hasChannel && (
                <Row>
                    <Col>
                        <Card className="mt-4">
                            <Card.Header as="h5" className="bg-info text-white">
                                Видео на канале
                            </Card.Header>
                            <Card.Body>
                                <VideoList 
                                    channelId={channelId}
                                    emptyMessage="У вас пока нет видео"
                                />
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}
        </Container>
    );
});

export default Profile;
