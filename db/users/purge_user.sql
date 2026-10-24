-- The user's widgets in master are removed by ON DELETE CASCADE.
DELETE FROM users
WHERE user_id = $1
RETURNING user_id;
