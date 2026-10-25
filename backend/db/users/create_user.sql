INSERT INTO users (user_name, user_email, password_hash)
VALUES ( $1, $2, $3 )
RETURNING user_id, user_name, user_email, user_bg, color, theme, flavor, compact, collision;
