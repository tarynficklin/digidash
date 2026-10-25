DELETE FROM master
WHERE master_id = $1 AND user_id = $2
RETURNING *;
