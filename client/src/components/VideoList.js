import React, { useEffect, useState } from "react";
import { Row, Col, Spinner, Alert } from "react-bootstrap";
import VideoCard from "./VideoCard";
import { get_channel_videos, get_videos } from "../http/videoAPI";

const VideoList = ({ channelId = null, emptyMessage = "Пока нет видео" }) => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
                    <VideoCard video={video} />
                </Col>
            ))}
        </Row>
    );
};

export default VideoList;