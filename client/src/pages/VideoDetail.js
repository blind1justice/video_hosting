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
  Form,
  InputGroup,
} from "react-bootstrap";
import { observer } from "mobx-react-lite";
import {
  Heart,
  HandThumbsUp,
  HandThumbsUpFill,
  HandThumbsDown,
  HandThumbsDownFill,
  Share,
  Bookmark,
  BookmarkFill,
  Clock,
  Eye,
  Calendar,
  Chat,
  Send,
  ChevronDown,
  ChevronUp,
  PersonCircle
} from "react-bootstrap-icons";
import { get_video_detail } from "../http/videoAPI";
import { subscribe, unsubscribe } from "../http/subscriptionAPI";
import { 
    send_dislike_on_video, 
    send_like_on_video,
    send_like_on_comment,
    send_dislike_on_comment
} from "../http/reactionAPI";
import {
  left_comment_on_video,
  left_comment_on_comment,
  get_all_comments_for_video,
  get_all_comments_for_comment,
  delete_comment,
  edit_comment
} from "../http/commentAPI"; // Убедитесь, что файл commentAPI.js существует
import { Context } from "..";

const VideoDetail = observer(() => {
  const {user} = useContext(Context);
  const currentUserId = user?.user?.sub || null;
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [video, setVideo] = useState(null);

  // Взаимодействия
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);

  const [likesCount, setLikesCount] = useState(0);
  const [dislikesCount, setDislikesCount] = useState(0);
  const [viewsCount, setViewsCount] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);

  // Комментарии
  const [comments, setComments] = useState([]); // Корневые комментарии
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState("");

  // Для загрузки ответов
  const [expandedReplies, setExpandedReplies] = useState({});
  const [replies, setReplies] = useState({});
  const [loadingReplies, setLoadingReplies] = useState({});

  const [replyingTo, setReplyingTo] = useState(null); // id комментария, на который отвечаем
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    if (id) {
      fetchVideoData();
      fetchComments();
    }
  }, [id]);

  const fetchVideoData = async () => {
    try {
      setLoading(true);
      const videoData = await get_video_detail(id);
      setVideo(videoData);
      setSubscribed(videoData.is_subscribed || false);
      setSubscriberCount(videoData.subscriber_count || 0);
      setLiked(videoData.is_liked || false);
      setDisliked(videoData.is_disliked || false);
      setViewsCount(videoData.views || 0);
      setLikesCount(videoData.like_count || 0);
      setDislikesCount(videoData.dislike_count || 0);
      setCommentsCount(videoData.comment_count || 0);
    } catch (err) {
      console.error("Ошибка при загрузке видео:", err);
      setError("Не удалось загрузить видео");
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      setLoadingComments(true);
      const data = await get_all_comments_for_video(id);
      setComments(data || []);
    } catch (err) {
      console.error("Ошибка при загрузке комментариев:", err);
      alert("Не удалось загрузить комментарии");
    } finally {
      setLoadingComments(false);
    }
  };

  const fetchReplies = async (parentId) => {
    if (replies[parentId]) return; // Уже загружены

    try {
      setLoadingReplies((prev) => ({ ...prev, [parentId]: true }));
      const data = await get_all_comments_for_comment(parentId);
      setReplies((prev) => ({ ...prev, [parentId]: data || [] }));
    } catch (err) {
      console.error("Ошибка при загрузке ответов:", err);
      alert("Не удалось загрузить ответы");
    } finally {
      setLoadingReplies((prev) => ({ ...prev, [parentId]: false }));
    }
  };

  const toggleReplies = (commentId) => {
    setExpandedReplies((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
    if (!expandedReplies[commentId] && !replies[commentId]) {
      fetchReplies(commentId);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
  
    const commentText = newComment.trim();
  
    try {
      setSubmittingComment(true);
      await left_comment_on_video(commentText, parseInt(id));
  
      setNewComment("");
  
      await fetchComments();
      setCommentsCount(prev => prev + 1);
  
    } catch (err) {
      console.error("Ошибка при отправке комментария:", err);
      alert(err.response?.data?.message || "Не удалось отправить комментарий");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Вы уверены, что хотите удалить комментарий?")) return;
  
    try {
      await delete_comment(commentId);
      await fetchComments();
      setExpandedReplies({});
      setCommentsCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Ошибка при удалении комментария:", err);
      alert(err.response?.data?.message || "Не удалось удалить комментарий");
    }
  };

  const handleSubscribe = async () => {
    if (!video?.channel?.id || subscriptionLoading) return;
    try {
      setSubscriptionLoading(true);
      if (subscribed) {
        await unsubscribe(video.channel.id);
        setSubscribed(false);
        setSubscriberCount((prev) => Math.max(0, prev - 1));
      } else {
        await subscribe(video.channel.id);
        setSubscribed(true);
        setSubscriberCount((prev) => prev + 1);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Ошибка подписки");
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const handleLikeOnVideo = async () => {
    try {
      await send_like_on_video(video.id);
      if (liked) {
        setLiked(false);
        setLikesCount((prev) => prev - 1);
      } else {
        if (disliked) {
          setDisliked(false);
          setDislikesCount((prev) => prev - 1);
        }
        setLiked(true);
        setLikesCount((prev) => prev + 1);
      }
    } catch (err) {
      alert("Ошибка лайка");
    }
  };

  const handleDislikeOnVideo = async () => {
    try {
      await send_dislike_on_video(video.id);
      if (disliked) {
        setDisliked(false);
        setDislikesCount((prev) => prev - 1);
      } else {
        if (liked) {
          setLiked(false);
          setLikesCount((prev) => prev - 1);
        }
        setDisliked(true);
        setDislikesCount((prev) => prev + 1);
      }
    } catch (err) {
      alert("Ошибка дизлайка");
    }
  };

  const handleLikeOnComment = async (comment) => {
    try {
        await send_like_on_comment(comment.id);
        await fetchComments();
      } catch (err) {
        alert("Ошибка лайка");
      }
  }

  const handleDisLikeOnComment = async (comment) => {
    try {
        await send_dislike_on_comment(comment.id);
        await fetchComments();
      } catch (err) {
        alert("Ошибка дизлайка");
      }
  }

  const handleReplySubmit = async (parentId) => {
    if (!replyText.trim()) return;
  
    try {
      await left_comment_on_comment(replyText.trim(), parentId); // используем ваш API с parent_id
  
      setReplyText("");
      setReplyingTo(null);
      setCommentsCount(prev => prev + 1);
      await fetchComments();
    } catch (err) {
      console.error("Ошибка при отправке ответа:", err);
      alert(err.response?.data?.message || "Не удалось отправить ответ");
    }
  };

  const handleEditSubmit = async (commentId) => {
    if (!editText.trim()) {
      alert("Комментарий не может быть пустым");
      return;
    }
  
    try {
      await edit_comment(commentId, editText.trim());
  
      setEditingCommentId(null);
      setEditText("");
  
      await fetchComments();
    } catch (err) {
      console.error("Ошибка при редактировании:", err);
      alert(err.response?.data?.message || "Не удалось сохранить изменения");
    }
  };

  const handleSave = () => setSaved(!saved);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: video?.title,
        text: video?.description?.substring(0, 100),
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Ссылка скопирована!");
    }
  };

  const formatDuration = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return h > 0
      ? `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
      : `${m}:${s.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatNumber = (num) => {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
    if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
    return num.toString();
  };

  const renderComment = (comment, isReply = false, depth = 0) => {
    if (depth > 10) {
      return <div className="text-muted small ms-5">Слишком глубокая вложенность</div>;
    }
  
    const user = comment.user || { username: "Вы", email: null, id: null };
    const username = user.username || user.email || "Аноним";
    const isOwnComment = currentUserId && comment.user?.id == currentUserId;
  
    // Определяем, редактируем ли мы именно этот комментарий
    const isEditing = editingCommentId === comment.id;
  
    const canReply = !isReply; // ответы на ответы запрещены
  
    return (
      <div key={comment.id} className={`comment-item ${isReply ? "ms-5" : "mb-4"}`}>
        <div className="d-flex">
          <NavLink
            to={`/users/${user.id}`}
            className="text-decoration-none"
            onClick={(e) => !user.id && e.preventDefault()}
          >
            <div
              className="bg-light rounded-circle d-flex align-items-center justify-content-center me-3"
              style={{ width: "40px", height: "40px", flexShrink: 0 }}
            >
              <PersonCircle size={28} className="text-muted" />
            </div>
          </NavLink>
  
          <div className="flex-grow-1">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <NavLink
                  to={`/users/${user.id}`}
                  className="text-decoration-none fw-bold"
                  onClick={(e) => !user.id && e.preventDefault()}
                >
                  {username}
                </NavLink>
                <small className="text-muted ms-2">
                  {formatDate(comment.created_at)}
                  {comment.is_edited && " (изменён)"}
                </small>
              </div>
  
              {/* Кнопки действий — только для своих комментариев */}
              {isOwnComment && !isEditing && (
                <div className="d-flex gap-3">
                  <Button
                    variant="link"
                    size="sm"
                    className="text-primary p-0 opacity-75"
                    onClick={() => {
                      setEditingCommentId(comment.id);
                      setEditText(comment.content);
                    }}
                  >
                    Редактировать
                  </Button>
                  <Button
                    variant="link"
                    size="sm"
                    className="text-danger p-0 opacity-75"
                    onClick={() => handleDeleteComment(comment.id)}
                  >
                    Удалить
                  </Button>
                </div>
              )}
            </div>
  
            {/* Текст комментария или форма редактирования */}
            {isEditing ? (
              <Form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleEditSubmit(comment.id);
                }}
                className="mt-3"
              >
                <InputGroup>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    style={{ resize: "none" }}
                    autoFocus
                  />
                  <Button variant="primary" type="submit" disabled={!editText.trim()}>
                    Сохранить
                  </Button>
                  <Button
                    variant="outline-secondary"
                    onClick={() => {
                      setEditingCommentId(null);
                      setEditText("");
                    }}
                  >
                    Отмена
                  </Button>
                </InputGroup>
              </Form>
            ) : (
              <p className="mt-2 mb-2">{comment.content}</p>
            )}
  
            {/* Нижние действия */}
            {!isEditing && (
              <div className="d-flex align-items-center gap-3 small text-muted">
                <Button variant={comment.is_liked ? "primary" : "outline-primary"} size="sm" onClick={() => handleLikeOnComment(comment)}>
                    {comment.is_liked ? <HandThumbsUpFill className="me-1" /> : <HandThumbsUp className="me-1" />}
                    {formatNumber(comment.like_count)}
                  </Button>
                  <Button variant={comment.is_disliked ? "danger" : "outline-danger"} size="sm" onClick={() => handleDisLikeOnComment(comment)}>
                    {comment.is_disliked ? <HandThumbsDownFill className="me-1" /> : <HandThumbsDown className="me-1" />}
                    {formatNumber(comment.dislike_count)}
                  </Button>
  
                {canReply && (
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 text-muted"
                    onClick={() => {
                      setReplyingTo(comment.id);
                      setReplyText("");
                    }}
                  >
                    Ответить
                  </Button>
                )}
              </div>
            )}
  
            {/* Форма ответа */}
            {replyingTo === comment.id && (
              <Form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleReplySubmit(comment.id);
                }}
                className="mt-3"
              >
                <InputGroup>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Ваш ответ..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    style={{ resize: "none" }}
                    autoFocus
                  />
                  <Button variant="primary" type="submit" disabled={!replyText.trim()}>
                    <Send />
                  </Button>
                  <Button
                    variant="outline-secondary"
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyText("");
                    }}
                  >
                    Отмена
                  </Button>
                </InputGroup>
              </Form>
            )}
  
            {/* Показать ответы — только для корневых */}
            {!isReply && comment.replies_count > 0 && depth < 5 && (
              <Button
                variant="link"
                size="sm"
                className="mt-2 p-0 text-primary fw-bold"
                onClick={() => toggleReplies(comment.id)}
              >
                {expandedReplies[comment.id] ? <ChevronUp /> : <ChevronDown />}
                {expandedReplies[comment.id]
                  ? "Скрыть ответы"
                  : `Показать ответы (${comment.replies_count})`}
              </Button>
            )}
  
            {/* Ответы */}
            {expandedReplies[comment.id] && !isReply && (
              <div className="mt-3">
                {loadingReplies[comment.id] ? (
                  <div className="text-center py-2">
                    <Spinner animation="border" size="sm" />
                  </div>
                ) : (
                  replies[comment.id]?.map((reply) => renderComment(reply, true, depth + 1))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Container className="mt-5 d-flex justify-content-center">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Загрузка видео...</p>
        </div>
      </Container>
    );
  }

  if (error || !video) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          <Alert.Heading>Ошибка</Alert.Heading>
          <p>{error || "Видео не найдено"}</p>
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
        <Col lg={8}>
          {/* Видеоплеер */}
          <Card className="mb-4 shadow-sm">
            <div className="ratio ratio-16x9">
              <video controls poster={video.image} className="w-100">
                <source src={video.video_file} />
                Ваш браузер не поддерживает видео.
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
                <div className="d-flex gap-2 mt-2 mt-sm-0">
                  <Button variant={liked ? "primary" : "outline-primary"} size="sm" onClick={handleLikeOnVideo}>
                    {liked ? <HandThumbsUpFill className="me-1" /> : <HandThumbsUp className="me-1" />}
                    {formatNumber(likesCount)}
                  </Button>
                  <Button variant={disliked ? "danger" : "outline-danger"} size="sm" onClick={handleDislikeOnVideo}>
                    {disliked ? <HandThumbsDownFill className="me-1" /> : <HandThumbsDown className="me-1" />}
                    {formatNumber(dislikesCount)}
                  </Button>
                  <Button variant="outline-secondary" size="sm" onClick={handleShare}>
                    <Share className="me-1" /> Поделиться
                  </Button>
                  <Button variant={saved ? "warning" : "outline-warning"} size="sm" onClick={handleSave}>
                    {saved ? <BookmarkFill /> : <Bookmark />}
                  </Button>
                </div>
              </div>

              <hr />

              {/* Канал */}
              {video.channel && (
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <NavLink to={`/users/${video.channel.user.id}`} className="text-decoration-none d-flex align-items-center">
                    <div
                      className="bg-light rounded-circle d-flex align-items-center justify-content-center me-3"
                      style={{ width: "50px", height: "50px" }}
                    >
                      <PersonCircle size={32} className="text-muted" />
                    </div>
                    <div>
                      <h6 className="mb-0">{video.channel.user.username || video.channel.user.email}</h6>
                      <small className="text-muted">{formatNumber(subscriberCount)} подписчиков</small>
                    </div>
                  </NavLink>
                  <Button
                    variant={subscribed ? "secondary" : "danger"}
                    size="sm"
                    onClick={handleSubscribe}
                    disabled={subscriptionLoading}
                  >
                    {subscriptionLoading && <Spinner size="sm" className="me-1" />}
                    {subscribed ? "Отписаться" : "Подписаться"}
                  </Button>
                </div>
              )}

              {/* Описание */}
              <div className="mb-4">
                <h6>Описание</h6>
                <p className="text-muted" style={{ whiteSpace: "pre-line" }}>
                  {video.description || "Описание отсутствует"}
                </p>
              </div>

              {/* Детали */}
              <div className="bg-light p-3 rounded">
                <h6 className="mb-3">Детали видео</h6>
                <Row>
                  <Col md={6}>
                    <small className="text-muted d-block">Длительность</small>
                    <span>
                      <Clock className="me-1" />
                      {formatDuration(video.duration)}
                    </span>
                  </Col>
                  <Col md={6}>
                    <small className="text-muted d-block">Формат</small>
                    <span>{video.original_format}</span>
                  </Col>
                </Row>
              </div>
            </Card.Body>
          </Card>

          {/* Комментарии */}
          <Card className="shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0">
                <Chat className="me-2" />
                Комментарии ({commentsCount})
              </h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleCommentSubmit} className="mb-4">
                <InputGroup>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Добавить комментарий..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    style={{ resize: "none" }}
                  />
                  <Button variant="primary" type="submit" disabled={submittingComment || !newComment.trim()}>
                    {submittingComment ? <Spinner size="sm" /> : <Send />}
                  </Button>
                </InputGroup>
              </Form>

              {loadingComments ? (
                <div className="text-center py-4">
                  <Spinner animation="border" />
                  <p className="mt-2">Загрузка комментариев...</p>
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <Chat size={48} className="mb-2" />
                  <p>Комментариев пока нет. Будьте первым!</p>
                </div>
              ) : (
                <div className="comments-list">
                  {comments.map((comment) => renderComment(comment))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Правая колонка */}
        <Col lg={4}>
          <Card className="sticky-top" style={{ top: "20px" }}>
            <Card.Header className="bg-white">
              <h6 className="mb-0">Следующее</h6>
            </Card.Header>
            <Card.Body>
              <div className="text-center py-3 text-muted">
                <small>Похожие видео и видео автора будут здесь</small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
});

export default VideoDetail;
