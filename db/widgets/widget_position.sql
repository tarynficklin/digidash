UPDATE master
SET	x=$1,
		y=$2,
		w=$3,
		h=$4
WHERE master_id=$5 AND user_id=$6
RETURNING *;
