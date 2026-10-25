-- Login lookup: $1 is a username or an email address (case-insensitive).
-- Returns password_hash, so never send this row to the client as-is.
SELECT * FROM users
WHERE lower(user_name) = lower($1) OR lower(user_email) = lower($1)
ORDER BY user_id
LIMIT 1;
