UPDATE master
SET	o1=$1,
		o2=$2,
		o3=$3,
		o4=$4,
		o5=$5,
		o6=$6
WHERE master_id=$7 AND user_id=$8
RETURNING *;
