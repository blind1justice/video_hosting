import React, { useState } from "react";
import { Card, Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import { Trash } from "react-bootstrap-icons";

const VideoCard = ({ video, currentUserId, currentUserRole, onDelete }) => {
    const [showDelete, setShowDelete] = useState(false);
    const isVideoOwner = video.channel?.user?.id == currentUserId;
    const isModerator = currentUserRole === 'admin' || currentUserRole === 'moderator';

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
            month: 'short',
            day: 'numeric'
        });
    };

    const handleDelete = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onDelete) {
            onDelete(video.id);
        }
    };

    return (
        <Card 
            className="h-100 shadow-sm video-card" 
            style={{ border: 'none' }}
            onMouseEnter={() => setShowDelete(true)}
            onMouseLeave={() => setShowDelete(false)}
        >
            <NavLink 
                to={`/videos/${video.id}`} 
                className="text-decoration-none text-dark"
            >
                <div className="position-relative">
                    <Card.Img
                        variant="top"
                        src={video.image}
                        alt={video.title}
                        style={{ 
                            height: "180px", 
                            width: "100%",
                            objectFit: "cover",
                            borderRadius: "8px 8px 0 0"
                        }}
                    />
                    <div className="position-absolute bottom-0 end-0 m-2 bg-dark text-white px-1 rounded small">
                        {formatDuration(video.duration)}
                    </div>
                    
                    {/* Кнопка удаления */}
                    {(isVideoOwner || isModerator) && showDelete && (
                        <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Удалить видео</Tooltip>}
                        >
                            <Button
                                variant="danger"
                                size="sm"
                                className="position-absolute top-0 end-0 m-2"
                                style={{ 
                                    opacity: 0.9,
                                    padding: "0.25rem 0.5rem"
                                }}
                                onClick={handleDelete}
                            >
                                <Trash size={16} />
                            </Button>
                        </OverlayTrigger>
                    )}
                </div>
                <Card.Body>
                    <Card.Title 
                        className="fs-6 mb-2" 
                        style={{ 
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                        }}
                    >
                        {video.title}
                    </Card.Title>
                    
                    <div className="d-flex justify-content-between align-items-center small text-muted">
                        <NavLink 
                            to={`/users/${video.channel.user.id}`} 
                            className="text-decoration-none text-dark"
                        >
                            <span className="text-truncate" style={{ maxWidth: '70%' }}>
                                {video.channel?.user?.username || video.channel?.user?.email}
                            </span>
                        </NavLink>
                        <span>
                            {video.created_at ? formatDate(video.created_at) : 'Недавно'}
                        </span>
                    </div>
                </Card.Body>
            </NavLink>
        </Card>
    );
};

export default VideoCard;
