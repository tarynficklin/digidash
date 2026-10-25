SELECT user_id, user_name, user_email, user_bg, color, theme, flavor, compact, collision
FROM users
WHERE user_id = $1;
