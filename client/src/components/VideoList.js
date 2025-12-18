import React, { useContext, useEffect, useState } from "react";
import { Row, Col, Spinner, Alert } from "react-bootstrap";
import VideoCard from "./VideoCard";
import { get_channel_videos, get_videos, delete_video } from "../http/videoAPI";
import { Context } from "..";

const VideoList = ({ channelId = null, emptyMessage = "Пока нет видео" }) => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useContext(Context);
    const currentUserId = user?.user?.sub || null;
    const currentUserRole = user?.user?.role || null;

    useEffect(() => {
        fetchVideos();
    }, [channelId]);

    const fetchVideos = async () => {
        try {
            setLoading(true);
            setError(null);
            let videos = null;
            if (channelId) {
                videos = await get_channel_videos(channelId);
            } else {
                videos = await get_videos();
            }
            setVideos(videos);
        } catch (err) {
            console.error("Ошибка при загрузке видео:", err);
            setError("Не удалось загрузить видео");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteVideo = async (videoId) => {
        if (!window.confirm("Вы уверены, что хотите удалить это видео?")) {
            return;
        }

        try {
            await delete_video(videoId);
            fetchVideos();
        } catch (err) {
            console.error("Ошибка при удалении видео:", err);
            alert("Не удалось удалить видео");
        }
    };

    if (loading) {
        return (
            <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Загрузка видео...</p>
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="danger" className="text-center">
                {error}
            </Alert>
        );
    }

    if (videos.length === 0) {
        return (
            <div className="text-center py-5">
                <p className="text-muted">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <Row xs={1} sm={2} md={3} lg={4} className="g-4">
            {videos.map((video) => (
                <Col key={video.id}>
                    <VideoCard 
                        video={video} 
                        currentUserId={currentUserId}
                        currentUserRole={currentUserRole}
                        onDelete={handleDeleteVideo}
                    />
                </Col>
            ))}
        </Row>
    );
};

export default VideoList;
