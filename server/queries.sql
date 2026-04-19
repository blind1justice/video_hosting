CREATE OR REPLACE VIEW report_view AS 
SELECT 
    r.id, r.reporter_id, r.video_id, r.reason, r.status, 
    r.created_at AS report_created_at, r.updated_at,
    rep.id AS rep_id, rep.email AS rep_email, rep.username AS rep_username,
    v.id AS v_id, v.title, v.status AS v_status, v.description AS v_desc,
    v.duration, v.original_format, v.storage_key, v.thumbnail_key, 
    v.created_at AS video_created_at,
    ch.id AS ch_id, ch.description AS ch_desc, ch.language, ch.country,
    owner.id AS owner_id, owner.email AS owner_email, 
    owner.username AS owner_username
FROM reports r
JOIN users rep ON rep.id = r.reporter_id
JOIN videos v ON v.id = r.video_id
JOIN channels ch ON ch.id = v.channel_id
JOIN users owner ON owner.id = ch.user_id
WHERE r.status = 'PENDING'
ORDER BY r.id desc;


CREATE OR REPLACE VIEW top_level_comments_view AS
SELECT 
    c.id AS comment_id, c.video_id, c.parent_id,
    c.content, c.is_edited, c.created_at AS comment_created_at,
    c.updated_at AS comment_updated_at,
    u.id AS user_id, u.email AS user_email,
    u.username AS user_username, u.avatar_url AS user_avatar_url,
    u.role AS user_role, u.created_at AS user_created_at,
    u.updated_at AS user_updated_at,
    COALESCE(replies_cnt.replies_count, 0) AS replies_count,
    COALESCE(like_cnt.like_count, 0) AS like_count,
    COALESCE(dislike_cnt.dislike_count, 0) AS dislike_count
FROM comments c
JOIN users u ON c.user_id = u.id
LEFT JOIN (
    SELECT parent_id, COUNT(*) AS replies_count
    FROM comments
    WHERE parent_id IS NOT NULL
    GROUP BY parent_id
) replies_cnt ON replies_cnt.parent_id = c.id
LEFT JOIN (
    SELECT comment_id, COUNT(*) AS like_count
    FROM reactions
    WHERE type = 'LIKE' AND comment_id IS NOT NULL
    GROUP BY comment_id
) like_cnt ON like_cnt.comment_id = c.id
LEFT JOIN (
    SELECT comment_id, COUNT(*) AS dislike_count
    FROM reactions
    WHERE type = 'DISLIKE' AND comment_id IS NOT NULL
    GROUP BY comment_id
) dislike_cnt ON dislike_cnt.comment_id = c.id
WHERE c.parent_id IS NULL
ORDER BY c.id ASC;

CREATE OR REPLACE VIEW users_with_channel_view AS
SELECT 
	u.id AS user_id, u.hashed_password, u.email AS user_email,
	u.username AS user_username, u.avatar_url AS user_avatar_url,
	u.role AS user_role, u.created_at AS user_created_at,
	u.updated_at AS user_updated_at, up.id AS pref_id,
	up.autoplay AS pref_autoplay, up.language AS pref_language,
	up.notifications_enabled AS pref_notifications_enabled,
	up.created_at AS pref_created_at, up.updated_at AS pref_updated_at,
	c.id AS channel_id, c.description AS channel_description,
	c.country AS channel_country, c.language AS channel_language,
	c.created_at AS channel_created_at, c.updated_at AS channel_updated_at,
	COALESCE(sub_cnt.subscriber_count, 0) AS subscriber_count
FROM users u
LEFT JOIN user_preferences up ON up.user_id = u.id
LEFT JOIN channels c ON c.user_id = u.id
LEFT JOIN (
    SELECT channel_id, COUNT(*) AS subscriber_count
    FROM subscriptions
    GROUP BY channel_id
) sub_cnt ON sub_cnt.channel_id = c.id
ORDER BY u.id;

SELECT * FROM REPORT_VIEW RV;
SELECT * FROM top_level_comments_view;
SELECT * FROM users_with_channel_view;