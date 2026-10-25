INSERT INTO master (user_id, widget_name, x, y, w, h, o1, o2, o3, o4, o5, o6)
VALUES ( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
RETURNING *;