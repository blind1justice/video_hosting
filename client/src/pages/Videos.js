import { observer } from "mobx-react-lite";
import React from "react";
import VideoList from "../components/VideoList";
import { Card } from "react-bootstrap";


const Videos = observer(() => {
    return (
        <Card className="mt-5">
            <Card.Body>
                <VideoList 
                    channelId={null}
                    emptyMessage="Видео пока нет"
                />
            </Card.Body>
        </Card>
    )
});

export default Videos;
