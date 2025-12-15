// pages/PublicProfile.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Container, Row, Col, Card, Spinner, Alert } from "react-bootstrap";
import { observer } from "mobx-react-lite";
import VideoList from "../components/VideoList";
import { get_user } from "../http/userAPI";

const PublicProfile = observer(() => {
    const { id } = useParams(); // ID пользователя из URL
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Состояния для пользователя
    const [userEmail, setUserEmail] = useState('');
    const [userUsername, setUserUsername] = useState('');
    const [userAvatarUrl, setUserAvatarUrl] = useState('');
    const [userCreatedAt, setUserCreatedAt] = useState('');
    
    // Состояния для канала
    const [channelId, setChannelId] = useState(null);
    const [channelDescription, setChannelDescription] = useState('');
    const [channelCountry, setChannelCountry] = useState('');
    const [channelLanguage, setChannelLanguage] = useState('');
    const [channelCreatedAt, setChannelCreatedAt] = useState('');
    
    const hasChannel = !!channelId;

    useEffect(() => {
        if (id) {
            fetchUserData();
        }
    }, [id]);

    const fetchUserData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const data = await get_user(id);
            
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
                } else {
                    resetChannelData();
                }
            }
        } catch (err) {
            console.error('Ошибка при загрузке данных пользователя:', err);
            setError('Не удалось загрузить профиль пользователя');
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

    if (error) {
        return (
            <Container className="mt-5">
                <Alert variant="danger">
                    <Alert.Heading>Ошибка</Alert.Heading>
                    <p>{error}</p>
                </Alert>
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
                            
                            <div className="mb-3">
                                <div className="fw-bold mb-1">Имя пользователя:</div>
                                <div className="text-muted">
                                    {userUsername || 'Не указано'}
                                </div>
                            </div>
                            
                            <div className="mb-3">
                                <div className="fw-bold mb-1">Дата регистрации:</div>
                                <div className="text-muted">
                                    {formatDate(userCreatedAt)}
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                
                {/* Правая карточка: Канал */}
                {hasChannel ? (
                    <Col md={6} className="mb-4">
                        <Card>
                            <Card.Header as="h5" className="bg-success text-white">
                                Канал пользователя
                            </Card.Header>
                            <Card.Body>
                                <div className="mb-3">
                                    <div className="fw-bold mb-1">Описание канала:</div>
                                    <div className="text-muted">
                                        {channelDescription || 'Не указано'}
                                    </div>
                                </div>
                                
                                <div className="mb-3">
                                    <div className="fw-bold mb-1">Страна:</div>
                                    <div className="text-muted">
                                        {channelCountry || 'Не указана'}
                                    </div>
                                </div>
                                
                                <div className="mb-3">
                                    <div className="fw-bold mb-1">Язык:</div>
                                    <div className="text-muted">
                                        {channelLanguage || 'Не указан'}
                                    </div>
                                </div>
                                
                                <div className="mb-3">
                                    <div className="fw-bold mb-1">Дата создания канала:</div>
                                    <div className="text-muted">
                                        {formatDate(channelCreatedAt)}
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ) : (
                    <Col md={6} className="mb-4">
                        <Card>
                            <Card.Header as="h5" className="bg-secondary text-white">
                                Канал отсутствует
                            </Card.Header>
                            <Card.Body>
                                <div className="text-muted text-center py-3">
                                    У этого пользователя нет канала
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                )}
            </Row>
            
            {/* Видео пользователя */}
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
                                    emptyMessage="У этого пользователя пока нет видео"
                                />
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}
        </Container>
    );
});

export default PublicProfile;
