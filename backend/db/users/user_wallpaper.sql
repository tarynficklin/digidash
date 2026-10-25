UPDATE users
SET	user_bg=$1,
		color=$2,
		theme=$3
WHERE user_id=$4
RETURNING user_id, user_name, user_email, user_bg, color, theme, flavor, compact, collision;
