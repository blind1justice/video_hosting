import React, { useContext, useEffect, useState } from "react";
import { useParams, NavLink } from "react-router-dom";
import { 
    Container, 
    Row, 
    Col, 
    Card, 
    Button, 
    Spinner, 
    Alert, 
    Badge,
    Form,
    InputGroup
} from "react-bootstrap";
import { observer } from "mobx-react-lite";
import { 
    Heart, 
    HeartFill, 
    HandThumbsDown, 
    HandThumbsDownFill,
    Share,
    Bookmark,
    BookmarkFill,
    Clock,
    Eye,
    PersonCircle,
    Calendar,
    Chat,
    Send,
    ThreeDotsVertical
} from "react-bootstrap-icons";
import VideoList from "../components/VideoList";
import { get_video_detail } from "../http/videoAPI";
import { subscribe, unsubscribe } from "../http/subscriptionAPI"; // Импортируем API подписок
import { Context } from "..";
import { send_dislike, send_like } from "../http/reactionAPI";

const VideoDetail = observer(() => {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [video, setVideo] = useState(null);
    
    // Состояния для взаимодействий
    const [liked, setLiked] = useState(false);
    const [disliked, setDisliked] = useState(false);
    const [saved, setSaved] = useState(false);
    const [subscribed, setSubscribed] = useState(false);
    const [subscriberCount, setSubscriberCount] = useState(0);
    const [subscriptionLoading, setSubscriptionLoading] = useState(false);
    
    // Состояния для лайков/дизлайков
    const [likesCount, setLikesCount] = useState(0);
    const [dislikesCount, setDislikesCount] = useState(0);
    const [viewsCount, setViewsCount] = useState(0);
    
    // Комментарии
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [loadingComments, setLoadingComments] = useState(false);
    
    // Связанные видео
    const [relatedVideos, setRelatedVideos] = useState([]);

    useEffect(() => {
        if (id) {
            fetchVideoData();
            fetchComments();
            fetchRelatedVideos();
        }
    }, [id]);

    const fetchVideoData = async () => {
        try {
            setLoading(true);
            const video = await get_video_detail(id, );
            
            setVideo(video);
            // Устанавливаем состояние подписки из полученных данных
            setSubscribed(video.is_subscribed || false);
            setSubscriberCount(video.subscriber_count || 0);
            setLiked(video.is_liked || false);
            setDisliked(video.is_disliked || false);
            setViewsCount(video.views || 0);
            setLikesCount(video.like_count || 0);
            setDislikesCount(video.dislike_count || 0);
            setLoading(false);
        } catch (err) {
            console.error("Ошибка при загрузке видео:", err);
            setError("Не удалось загрузить видео");
            setLoading(false);
        }
    };

    const fetchComments = async () => {
        try {
            setLoadingComments(true);
            // Здесь будет реальный API запрос
            // const data = await get_video_comments(id);
            
            // Заглушка комментариев
            setTimeout(() => {
                const mockComments = [
                    {
                        id: 1,
                        text: "Отличное видео! Очень информативно и полезно.",
                        user: {
                            id: 2,
                            username: "user123",
                            avatar_url: "https://via.placeholder.com/40"
                        },
                        created_at: "2024-01-16T14:30:00Z",
                        likes: 12
                    },
                    {
                        id: 2,
                        text: "Спасибо за контент, жду продолжения!",
                        user: {
                            id: 3,
                            username: "viewer456",
                            avatar_url: "https://via.placeholder.com/40"
                        },
                        created_at: "2024-01-16T12:15:00Z",
                        likes: 5
                    },
                    {
                        id: 3,
                        text: "Интересная тема, но можно было бы подробнее рассказать о...",
                        user: {
                            id: 4,
                            username: "commenter789",
                            avatar_url: "https://via.placeholder.com/40"
                        },
                        created_at: "2024-01-15T16:45:00Z",
                        likes: 3
                    }
                ];
                
                setComments(mockComments);
                setLoadingComments(false);
            }, 800);
        } catch (err) {
            console.error("Ошибка при загрузке комментариев:", err);
            setLoadingComments(false);
        }
    };

    const fetchRelatedVideos = async () => {
        // Здесь будет реальный API запрос для связанных видео
        // Можно использовать тот же VideoList компонент
    };

    // Функция для обработки подписки/отписки
    const handleSubscribe = async () => {
        if (!video?.channel?.id || subscriptionLoading) return;
        
        try {
            setSubscriptionLoading(true);
            
            if (subscribed) {
                await unsubscribe(video.channel.id);
                setSubscribed(false);
                setSubscriberCount(prev => Math.max(0, prev - 1));
            } else {
                await subscribe(video.channel.id);
                setSubscribed(true);
                setSubscriberCount(prev => prev + 1);
            }
        } catch (err) {
            console.error("Ошибка при изменении подписки:", err);
            alert(err.response?.data?.message || "Произошла ошибка при изменении подписки");
        } finally {
            setSubscriptionLoading(false);
        }
    };

    const handleLike = async () => {
        try {
            await send_like(video.id);
            if (liked) {
                setLiked(false);
                setLikesCount(prev => prev - 1);
            } else {
                if (disliked) {
                    setDisliked(false);
                    setDislikesCount(prev => prev - 1);
                }
                setLiked(true);
                setLikesCount(prev => prev + 1);
            }
        } catch (err) {
            console.error("Ошибка при отметке лайка:", err);
            alert(err.response?.data?.message || "Произошла ошибка при отметке лайка");
        }
    };

    const handleDislike = async () => {
        try {
            await send_dislike(video.id);
            if (disliked) {
                setDisliked(false);
                setDislikesCount(prev => prev - 1);
            } else {
                if (liked) {
                    setLiked(false);
                    setLikesCount(prev => prev - 1);
                }
                setDisliked(true);
                setDislikesCount(prev => prev + 1);
            }
        } catch (err) {
            console.error("Ошибка при отметке дизлайка:", err);
            alert(err.response?.data?.message || "Произошла ошибка при отметке дизлайка");
        }
    };

    const handleSave = () => {
        setSaved(!saved);
        // Здесь будет API запрос на сохранение в избранное
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: video?.title,
                text: video?.description?.substring(0, 100),
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert("Ссылка скопирована в буфер обмена!");
        }
    };

    const handleCommentSubmit = (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        const newCommentObj = {
            id: comments.length + 1,
            text: newComment,
            user: {
                id: 1, // текущий пользователь
                username: "Вы",
                avatar_url: "https://via.placeholder.com/40"
            },
            created_at: new Date().toISOString(),
            likes: 0
        };

        setComments([newCommentObj, ...comments]);
        setNewComment("");
    };

    const formatDuration = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
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

    const formatNumber = (num) => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    };

    if (loading) {
        return (
            <Container className="mt-5 d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <div className="text-center">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3">Загрузка видео...</p>
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
                    <Button variant="primary" onClick={() => window.history.back()}>
                        Назад
                    </Button>
                </Alert>
            </Container>
        );
    }

    if (!video) {
        return (
            <Container className="mt-5">
                <Alert variant="warning">
                    <Alert.Heading>Видео не найдено</Alert.Heading>
                    <p>Запрошенное видео не существует или было удалено.</p>
                    <Button variant="primary" onClick={() => window.history.back()}>
                        Назад
                    </Button>
                </Alert>
            </Container>
        );
    }

    return (
        <Container className="mt-4">
            <Row>
                {/* Основное содержимое - левая часть */}
                <Col lg={8}>
                    {/* Видеоплеер */}
                    <Card className="mb-4 shadow-sm">
                        <div className="ratio ratio-16x9">
                            <video
                                controls
                                poster={video.image}
                                className="w-100"
                                style={{ backgroundColor: '#000' }}
                            >
                                <source src={video.video_file} />
                                Ваш браузер не поддерживает видео тег.
                            </video>
                        </div>
                    </Card>

                    {/* Информация о видео */}
                    <Card className="mb-4 shadow-sm">
                        <Card.Body>
                            <h3 className="mb-3">{video.title}</h3>
                            
                            <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
                                <div className="text-muted small">
                                    <Eye className="me-1" />
                                    <span className="me-3">{formatNumber(viewsCount)} просмотров</span>
                                    <Calendar className="me-1" />
                                    <span>{formatDate(video.created_at)}</span>
                                </div>
                                
                                <div className="d-flex align-items-center mt-2 mt-sm-0">
                                    <Button 
                                        variant={liked ? "primary" : "outline-primary"} 
                                        size="sm"
                                        className="me-2"
                                        onClick={handleLike}
                                    >
                                        {liked ? <HeartFill className="me-1" /> : <Heart className="me-1" />}
                                        {formatNumber(likesCount)}
                                    </Button>
                                    
                                    <Button 
                                        variant={disliked ? "danger" : "outline-danger"} 
                                        size="sm"
                                        className="me-2"
                                        onClick={handleDislike}
                                    >
                                        {disliked ? <HandThumbsDownFill className="me-1" /> : <HandThumbsDown className="me-1" />}
                                        {formatNumber(dislikesCount)}
                                    </Button>
                                    
                                    <Button 
                                        variant="outline-secondary" 
                                        size="sm"
                                        className="me-2"
                                        onClick={handleShare}
                                    >
                                        <Share className="me-1" />
                                        Поделиться
                                    </Button>
                                    
                                    <Button 
                                        variant={saved ? "warning" : "outline-warning"} 
                                        size="sm"
                                        onClick={handleSave}
                                    >
                                        {saved ? <BookmarkFill /> : <Bookmark />}
                                    </Button>
                                    
                                    <Button 
                                        variant="outline-secondary" 
                                        size="sm"
                                        className="ms-2"
                                    >
                                        <ThreeDotsVertical />
                                    </Button>
                                </div>
                            </div>
                            
                            <hr />
                            
                            {/* Информация о канале */}
                            {video.channel && (
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <div className="d-flex align-items-center">
                                        <NavLink to={`/users/${video.channel.user.id}`} className="text-decoration-none">
                                            <div className="d-flex align-items-center">
                                                {/* <img
                                                    src={video.channel.user.avatar_url}
                                                    alt={video.channel.user.username || video.channel.user.email}
                                                    className="rounded-circle me-3"
                                                    style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                                /> */}
                                                <div>
                                                    <h6 className="mb-0">{video.channel.user.username || video.channel.user.email}</h6>
                                                    <small className="text-muted">
                                                        {formatNumber(subscriberCount)} подписчиков
                                                    </small>
                                                </div>
                                            </div>
                                        </NavLink>
                                    </div>
                                    
                                    <Button 
                                        variant={subscribed ? "secondary" : "danger"} 
                                        size="sm"
                                        onClick={handleSubscribe}
                                        disabled={subscriptionLoading}
                                    >
                                        {subscriptionLoading ? (
                                            <Spinner
                                                as="span"
                                                animation="border"
                                                size="sm"
                                                role="status"
                                                aria-hidden="true"
                                                className="me-1"
                                            />
                                        ) : null}
                                        {subscribed ? 'Отписаться' : 'Подписаться'}
                                    </Button>
                                </div>
                            )}
                            
                            {/* Описание видео */}
                            <div className="mb-4">
                                <h6>Описание</h6>
                                <p className="text-muted" style={{ whiteSpace: 'pre-line' }}>
                                    {video.description || 'Описание отсутствует'}
                                </p>
                            </div>
                            
                            {/* Детали видео */}
                            <div className="bg-light p-3 rounded">
                                <h6 className="mb-3">Детали видео</h6>
                                <Row>
                                    <Col md={6}>
                                        <div className="mb-2">
                                            <small className="text-muted d-block">Длительность</small>
                                            <span>
                                                <Clock className="me-1" />
                                                {formatDuration(video.duration)}
                                            </span>
                                        </div>
                                    </Col>
                                    <Col md={6}>
                                        <div className="mb-2">
                                            <small className="text-muted d-block">Формат</small>
                                            <span>{video.original_format}</span>
                                        </div>
                                    </Col>
                                </Row>
                            </div>
                        </Card.Body>
                    </Card>

                    {/* Комментарии */}
                    <Card className="shadow-sm">
                        <Card.Header className="bg-white border-bottom">
                            <h5 className="mb-0">
                                <Chat className="me-2" />
                                Комментарии ({comments.length})
                            </h5>
                        </Card.Header>
                        
                        <Card.Body>
                            {/* Форма для добавления комментария */}
                            <Form onSubmit={handleCommentSubmit} className="mb-4">
                                <InputGroup>
                                    <Form.Control
                                        as="textarea"
                                        rows={2}
                                        placeholder="Добавить комментарий..."
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        style={{ resize: 'none' }}
                                    />
                                    <Button 
                                        variant="primary" 
                                        type="submit"
                                        disabled={!newComment.trim()}
                                    >
                                        <Send />
                                    </Button>
                                </InputGroup>
                            </Form>
                            
                            {/* Список комментариев */}
                            {loadingComments ? (
                                <div className="text-center py-4">
                                    <Spinner animation="border" size="sm" />
                                    <p className="mt-2">Загрузка комментариев...</p>
                                </div>
                            ) : comments.length === 0 ? (
                                <div className="text-center py-4 text-muted">
                                    <Chat size={48} className="mb-2" />
                                    <p>Комментариев пока нет. Будьте первым!</p>
                                </div>
                            ) : (
                                <div className="comments-list">
                                    {comments.map((comment) => (
                                        <div key={comment.id} className="comment-item mb-3 pb-3 border-bottom">
                                            <div className="d-flex">
                                                <NavLink 
                                                    to={`/user/${comment.user.id}`}
                                                    className="text-decoration-none"
                                                >
                                                    {/* <img
                                                        src={comment.user.avatar_url}
                                                        alt={comment.user.username}
                                                        className="rounded-circle me-3"
                                                        style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                                    /> */}
                                                </NavLink>
                                                
                                                <div className="flex-grow-1">
                                                    <div className="d-flex justify-content-between align-items-start">
                                                        <div>
                                                            <NavLink 
                                                                to={`/user/${comment.user.id}`}
                                                                className="text-decoration-none fw-bold"
                                                            >
                                                                {comment.user.username}
                                                            </NavLink>
                                                            <small className="text-muted ms-2">
                                                                {formatDate(comment.created_at)}
                                                            </small>
                                                        </div>
                                                        <Button 
                                                            variant="link" 
                                                            size="sm"
                                                            className="text-decoration-none p-0"
                                                        >
                                                            <Heart size={14} />
                                                            <small className="ms-1">{comment.likes}</small>
                                                        </Button>
                                                    </div>
                                                    
                                                    <p className="mt-2 mb-0">{comment.text}</p>
                                                    
                                                    <div className="mt-2">
                                                        <Button 
                                                            variant="link" 
                                                            size="sm" 
                                                            className="text-decoration-none p-0 me-3"
                                                        >
                                                            Ответить
                                                        </Button>
                                                        <Button 
                                                            variant="link" 
                                                            size="sm" 
                                                            className="text-decoration-none p-0"
                                                        >
                                                            <Heart size={12} className="me-1" />
                                                            Нравится
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
                
                {/* Правая колонка - связанные видео */}
                <Col lg={4}>
                    <Card className="sticky-top" style={{ top: '20px' }}>
                        <Card.Header className="bg-white">
                            <h6 className="mb-0">Следующее</h6>
                        </Card.Header>
                        <Card.Body>
                            {/* Здесь можно использовать VideoList для связанных видео */}
                            <div className="mb-4">
                                <h6 className="text-muted mb-3">Похожие видео</h6>
                                {/* Заглушка для связанных видео */}
                                <div className="text-center py-3 text-muted">
                                    <small>Здесь будут отображаться похожие видео</small>
                                </div>
                            </div>
                            
                            <div>
                                <h6 className="text-muted mb-3">От этого автора</h6>
                                {/* Заглушка для видео автора */}
                                <div className="text-center py-3 text-muted">
                                    <small>Здесь будут другие видео этого автора</small>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
});

export default VideoDetail;
