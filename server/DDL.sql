CREATE TYPE role AS ENUM ('USER', 'MODERATOR', 'ADMIN');
CREATE TYPE availablelanguages AS ENUM ('RUSSIAN', 'ENGLISH');
CREATE TYPE videostatus AS ENUM ('PROCESSING', 'PROCESSED', 'FAILED');
CREATE TYPE reportstatus AS ENUM ('PENDING', 'RESOLVED', 'REJECTED');
CREATE TYPE reactiontype AS ENUM ('LIKE', 'DISLIKE');

CREATE TABLE users (
	id SERIAL PRIMARY KEY,
	email VARCHAR(100) NOT NULL UNIQUE,
	username VARCHAR(50) UNIQUE,
	hashed_password VARCHAR(100) NOT NULL,
	avatar_url VARCHAR(255),
	role role NOT NULL DEFAULT 'USER',
	created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE channels (
	id SERIAL PRIMARY KEY,
	user_id INTEGER NOT NULL UNIQUE,
	description TEXT,
	country VARCHAR(50),
	language VARCHAR(50),
	created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
	FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE user_preferences (
	id SERIAL PRIMARY KEY,
	user_id INTEGER NOT NULL UNIQUE,
	autoplay BOOLEAN NOT NULL DEFAULT FALSE,
	language availablelanguages NOT NULL DEFAULT 'RUSSIAN',
	notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
	created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
	FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE subscriptions (
	id SERIAL PRIMARY KEY,
	subscriber_id INTEGER NOT NULL,
	channel_id INTEGER NOT NULL,
	created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
	FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE,
	FOREIGN KEY (subscriber_id) REFERENCES users(id) ON DELETE CASCADE,
	CONSTRAINT uq_subscriber_channel UNIQUE (subscriber_id, channel_id)
);

CREATE TABLE videos (
	id SERIAL PRIMARY KEY,
	channel_id INTEGER NOT NULL,
	title VARCHAR(255) NOT NULL,
	status videostatus NOT NULL DEFAULT 'PROCESSING',
	description TEXT,
	duration INTEGER NOT NULL DEFAULT 0,
	original_format VARCHAR(30) NOT NULL,
	storage_key VARCHAR(500) NOT NULL,
	thumbnail_key VARCHAR(500) NOT NULL,
	created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
	FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE
);

CREATE TABLE comments (
	id SERIAL PRIMARY KEY,
	user_id INTEGER NOT NULL,
	video_id INTEGER,
	parent_id INTEGER,
	content TEXT NOT NULL,
	is_edited BOOLEAN NOT NULL DEFAULT FALSE,
	created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
	CONSTRAINT check_video_or_parent_not_null CHECK ((video_id IS NULL) != (parent_id IS NULL)),
	FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE,
	FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
	FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
);

CREATE TABLE reports (
	id SERIAL PRIMARY KEY,
	reporter_id INTEGER NOT NULL,
	video_id INTEGER NOT NULL,
	reason TEXT NOT NULL,
	status reportstatus NOT NULL DEFAULT 'PENDING',
	created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
	FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
	FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
	CONSTRAINT uq_reporter_video UNIQUE (reporter_id, video_id)
);

CREATE TABLE reactions (
	id SERIAL PRIMARY KEY,
	user_id INTEGER NOT NULL,
	video_id INTEGER,
	comment_id INTEGER,
	type reactiontype NOT NULL,
	created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
	CONSTRAINT check_video_or_comment_not_null CHECK ((video_id IS NULL) != (comment_id IS NULL)),
	FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
	FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
	FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
);
--
CREATE TABLE video_formats (
	id SERIAL PRIMARY KEY,
	video_id INTEGER NOT NULL,
	format VARCHAR(10) NOT NULL,
	bitrate INTEGER,
	resolution VARCHAR(20),
	storage_key VARCHAR(500) NOT NULL,
	created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
	FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
);

CREATE TABLE subtitles (
	id SERIAL PRIMARY KEY,
	video_id INTEGER NOT NULL,
	language VARCHAR(20) NOT NULL,
	storage_key VARCHAR(500) NOT NULL,
	created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
	FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
);

CREATE TABLE playlists (
	id SERIAL PRIMARY KEY,
	user_id INTEGER NOT NULL,
	title VARCHAR(255) NOT NULL,
	description TEXT,
	is_public BOOLEAN DEFAULT FALSE,
	created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
	FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE playlists_videos (
    id SERIAL PRIMARY KEY,
    playlist_id INTEGER NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
    video_id INTEGER NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_playlist_video UNIQUE (playlist_id, video_id)
);

CREATE TABLE notifications (
	id SERIAL PRIMARY KEY,
	user_id INTEGER NOT NULL,
	content TEXT NOT NULL,
	is_read BOOLEAN DEFAULT FALSE,
	created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
	FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);

CREATE INDEX idx_channels_user_id ON channels(user_id);
CREATE INDEX idx_channels_country_language ON channels(country, language);

CREATE INDEX idx_subscriptions_subscriber_id ON subscriptions(subscriber_id);
CREATE INDEX idx_subscriptions_channel_id ON subscriptions(channel_id);

CREATE INDEX idx_videos_channel_id ON videos(channel_id);
CREATE INDEX idx_videos_status ON videos(status);

CREATE INDEX idx_comments_video_id ON comments(video_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);

CREATE INDEX idx_reports_video_id ON reports(video_id);
CREATE INDEX idx_reports_reporter_id ON reports(reporter_id);
CREATE INDEX idx_reports_status ON reports(status);

CREATE INDEX idx_reactions_user_id ON reactions(user_id);
CREATE INDEX idx_reactions_video_id ON reactions(video_id);
CREATE INDEX idx_reactions_comment_id ON reactions(comment_id);

CREATE INDEX idx_video_formats_video_id ON video_formats(video_id);

CREATE INDEX idx_subtitles_video_id ON subtitles(video_id);

CREATE INDEX idx_playlists_user_id ON playlists(user_id);

CREATE INDEX idx_playlistsvideos_playlist_id ON playlists_videos(playlist_id);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);

