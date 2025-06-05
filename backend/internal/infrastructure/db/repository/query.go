package repository

const (
	matchQuery = `SELECT EXISTS (SELECT 1 FROM public.auth_users WHERE login = $1)`

	registerQuery = `INSERT INTO public.auth_users (login, pass, name) VALUES ($1, $2, $3)`

	getPassQuery = `SELECT id, pass FROM public.auth_users WHERE login = $1`

	saveTokenQuery = `INSERT INTO public.sessions (user_id, token, created_at) VALUES ($1, $2, $3) 
					  ON CONFLICT (user_id) DO UPDATE
					  SET token = EXCLUDED.token,
    				  created_at = EXCLUDED.created_at;`

	checkingQuery = `SELECT user_id, created_at FROM public.sessions WHERE token = $1`

	deleteCookieQuery = `DELETE FROM public.sessions WHERE user_id = $1`

	saveNewAdsQuery = `
		INSERT INTO public.ads (
			title,
			name_appartment,
			square,
			num_rooms,
			floor,
			year_construction,
			address,
			price,
			ceiling_height,
			description,
			created_at,
			author_id,
			ads_type,
			is_active,
			stoped_at,
			city,
			district,
			pledge,
			bank_id
		) VALUES (
			$1,  $2,  $3,  $4,  $5,
			$6,  $7,  $8,  $9,  $10,
			NOW(), $11, $12, $13, $14,
			$15, $16, $17, $18
		) RETURNING id;
		`

	savePhotoQuery = `INSERT INTO public.ads_photos (ads_id, url, main_url) VALUES ($1, $2, $3)`
	saveDocQuery   = `INSERT INTO public.document (id_ads, url_doc) VALUES ($1, $2)`

	getAllAdsQuery = `SELECT 
		ads.id,
		ads.title,
		ads.name_appartment,
		ads.square,
		ads.num_rooms,
		ads.floor,
		ads.year_construction,
		ads.address,
		ads.price,
		ads.ceiling_height,
		ads.description,
		ads.created_at,
		ads.ads_type,
		ads.is_active,
		ads.stoped_at,
		ads.city,
		ads.district,
	FROM public.ads
	ORDER BY ads.created_at DESC;
`

	getByIdAdsQuery = `
	SELECT 
		a.id,
		a.title,
		a.name_appartment,
		a.square,
		a.num_rooms,
		a.floor,
		a.year_construction,
		a.address,
		a.price,
		a.ceiling_height,
		a.description,
		a.created_at,
		a.ads_type,
		a.is_active,
		a.stoped_at,
		a.city,
		a.district,
		u.id           AS author_id,
		u.login        AS author_login,
		u.name         AS author_name,
		u.created_at   AS author_created_at
	FROM public.ads a
	JOIN public.auth_users u ON a.author_id = u.id
	WHERE a.id = $1;
	`

	getByIdMyAdsQuery = `SELECT id, title, name_appartment, square, num_rooms, floor,
		       year_construction, address, price, ceiling_height, description, created_at, ads_type, is_active, stoped_at, city, district
		FROM public.ads
		WHERE id = $1 and author_id = $2`

	getPhotoByIdQuery = `SELECT id, url, main_url FROM public.ads_photos WHERE ads_id = $1 and main_url = true`

	getPhotosByIdQuery = `SELECT id, url, main_url FROM public.ads_photos WHERE ads_id = $1`

	getMyAdsQuery = `SELECT 
			ads.id,
			ads.title,
			ads.name_appartment,
			ads.square,
			ads.num_rooms,
			ads.floor,
			ads.year_construction,
			ads.address,
			ads.price,
			ads.ceiling_height,
			ads.description,
			ads.created_at,
			ads.ads_type,
			ads.is_active,
			ads.stoped_at,
			ads.city,
			ads.district
		FROM public.ads WHERE author_id = $1
		ORDER BY ads.created_at DESC`

	updateByIdAdsQuery = `
		UPDATE public.ads
		SET
			title             = $1,
			name_appartment   = $2,
			square            = $3,
			num_rooms         = $4,
			floor             = $5,
			year_construction = $6,
			address           = $7,
			price             = $8,
			ceiling_height    = $9,
			description       = $10,
			ads_type          = $11,
			city              = $12,
			district          = $13,
			pledge            = $14,
			bank_id           = $15
		WHERE id = $16 AND author_id = $17;
`

	deletePhotoQuery = `DELETE FROM public.ads_photos WHERE ads_id = $1 AND id = ANY($2)`

	updateMainPhotoQuery = `UPDATE public.ads_photos SET main_url = true WHERE id = (SELECT id FROM public.ads_photos WHERE ads_id = $1 ORDER BY id LIMIT 1)`

	getMainPhotosQuery = `SELECT EXISTS (SELECT 1 FROM public.ads_photos WHERE ads_id = $1 AND main_url = true)`

	deletePhotoWithAdsQuery = `DELETE FROM public.ads_photos WHERE ads_id = $1`

	deleteByIdAdsQuery = `DELETE FROM public.ads WHERE id = $1`

	updAllAdsQuery = `SELECT id, created_at, is_active, stoped_at, FROM public.ads`

	deactiveAdsQuery = `UPDATE public.ads SET is_active = false WHERE id = $1`

	saveMessQuery = `INSERT INTO messages (sender_id, receiver_id, content) VALUES ($1, $2, $3)`

	getDescOfAppartQuery = `
		SELECT 
			id,
			name,
			description,
			address,
			floors,
			class,
			parking,
			peculiarities,
			residents_value,
			comments
		FROM appartments
		WHERE id = $1
	`

	getCommentsQuery = `SELECT id, comment FROM comments WHERE appartment_id = $1`

	delCommQuery = `DELETE FROM comments WHERE id = $1 and user_id = $2`

	getStatsQuery = `SELECT
			COUNT(*) AS total_messages,
			COUNT(DISTINCT sender_id) + COUNT(DISTINCT receiver_id) AS active_users,
			AVG(LENGTH(content)) AS average_length
		FROM messages;`
	getStatsTopQuery = `
		SELECT sender_id, COUNT(*) AS msg_count
		FROM messages
		GROUP BY sender_id
		ORDER BY msg_count DESC
		LIMIT 5;
	`

	getHistoryQuery = `
		SELECT id, sender_id, receiver_id, content, created_at
		FROM messages
		WHERE (sender_id = $1 AND receiver_id = $2)
		   OR (sender_id = $2 AND receiver_id = $1)
		ORDER BY created_at
		LIMIT $3 OFFSET $4;
	`

	getDialogsQuery = `
		SELECT 
			u.id AS user_id,
			u.name,
			m.content,
			m.created_at
		FROM (
			SELECT *,
				CASE 
					WHEN sender_id = $1 THEN receiver_id
					ELSE sender_id
				END AS companion_id
			FROM messages
			WHERE sender_id = $1 OR receiver_id = $1
			ORDER BY created_at ASC
		) m
		JOIN auth_users u ON u.id = m.companion_id
	`

	getSearchChatQuery = `
		SELECT id, sender_id, receiver_id, content, created_at
		FROM messages
		WHERE
		  (
			(sender_id = $1 AND receiver_id = $2)
			OR
			(sender_id = $2 AND receiver_id = $1)
		  )
		  AND content ILIKE '%' || $3 || '%'
		ORDER BY created_at DESC
		LIMIT 100;
	`

	getSearchQuery = `
		SELECT id, sender_id, receiver_id, content, created_at
		FROM messages
		WHERE
		  (sender_id = $1 OR receiver_id = $1)
		  AND content ILIKE '%' || $2 || '%'
		ORDER BY created_at DESC
		LIMIT 100;
	`

	getPledgeQuery = `
		SELECT
			ads.id,
			ads.title,
			ads.name_appartment,
			ads.square,
			ads.num_rooms,
			ads.floor,
			ads.year_construction,
			ads.address,
			ads.price,
			ads.ceiling_height,
			ads.description,
			ads.created_at,
			ads.ads_type,
			ads.is_active,
			ads.stoped_at,
			ads.city,
			ads.district,
			ads.bank_id,
			auth_users.id,
			auth_users.name
		FROM public.ads JOIN public.auth_users ON ads.author_id = auth_users.id WHERE pledge = true`

	getAllDevelopersQuery = `
		SELECT id, name, description, phone, email, logo_url, created_at
		FROM developers
		ORDER BY name
	`

	saveDeveloperMessageQuery = `
		INSERT INTO developer_messages (developer_id, user_id, message, contact_info)
		VALUES ($1, $2, $3, $4)
	`

	getUserByIDQuery = `
		SELECT
			id,
			login,
			name,
			balance,
			subscribe,
			created_at
		FROM auth_users
		WHERE id = $1
		`

	getApartmentsByDistrictQuery = `
        SELECT 
            id,
            name,
            description,
            address,
            floors,
            class,
            parking,
            peculiarities,
            residents_value,
            comments,
            district_id
        FROM public.appartments
        WHERE district_id = $1
    `
	getApartmentByIDQuery = `
        SELECT 
            id,
            name,
            description,
            address,
            floors,
            class,
            parking,
            peculiarities,
            residents_value,
            comments,
            district_id
        FROM public.appartments
        WHERE id = $1
    `

	getAllCitiesQuery = `
		SELECT 
			id, 
			name
		FROM cities
		ORDER BY name;
	`

	getDistrictsByCityQuery = `
  		SELECT 
			id, 
			city_id, 
			name
		FROM districts
		WHERE city_id = $1
		ORDER BY name;
	`

	sqlListPhotos = `
      SELECT id, url, main_url, sort_index
      FROM photos
      WHERE ad_id = $1
      ORDER BY sort_index`

	sqlInsertPhoto = `
      INSERT INTO photos (ad_id, url, main_url, sort_index)
      VALUES (
        $1, $2, $3,
        COALESCE((SELECT MAX(sort_index) FROM photos WHERE ad_id=$1),0)+1
      )
      RETURNING id, url, main_url, sort_index
    `

	sqlDeletePhoto = `DELETE FROM photos WHERE ad_id=$1 AND id=$2`

	// Обновляем сразу sort_index и флаг main_url
	sqlUpdatePhoto = `
      UPDATE photos
         SET sort_index = $1
           , main_url    = $2
       WHERE ad_id = $3
         AND id    = $4
    `

	checkSubQuery = `
    SELECT subscribe
    FROM auth_users
    WHERE id = $1;`

	addNewCommQuery = `
    INSERT INTO comments (appartment_id, user_id, comment) VALUES ($1, $2, $3);`

	addingBalanceQuery = `
		UPDATE auth_users
		SET balance = balance + $1
		WHERE id = $2
	`

	countMoneyQuery = `Select balance FROM auth_users where id = $1`

	buySubscribeQuery = `UPDATE auth_users
		SET balance = $1, stoped_at = $2, subscribe = true
		WHERE id = $3`

	changesStatusQuery = `UPDATE ads set is_active = false where id = $1`

	changesBalanceQuery = `UPDATE auth_users SET balance = $1 WHERE id = $2`

	addDealQuery = `INSERT INTO sales (id_ads, buyer_id, seller_id, status_purchase, purchase_amount, confirmation_waiting_date, purchase_canceled, price_with_service) VALUES ($1, $2, $3, false, $4, $5, false, $6);`

	proofOfPurchaseQuery  = `UPDATE sales set status_purchase = $1 where id = $2 and buyer_id = $3`
	addingBalanceOfSeller = `UPDATE auth_users SET balance = balance + $1 WHERE id = $2`

	returnBalanceQuery = `UPDATE auth_users
		SET balance = balance + (
			SELECT SUM(s.price_with_service)
			FROM sales s
			WHERE s.id = $2
		)
		WHERE id = $1;`
	canceledBuyQuery = `
			UPDATE sales
			SET purchase_canceled = true
			WHERE id = $1;
		`

	confirmationOfUserQuery = `
		SELECT
			sales.id,
			sales.id_ads,
			buyer.id as buyer_id,
			buyer.name as buyer_name,
			seller.id as seller_id,
			seller.name as seller_name,
			sales.status_purchase,
			sales.purchase_amount,
			sales.confirmation_waiting_date,
			sales.purchase_canceled,
			sales.price_with_service
		FROM public.sales
		JOIN public.auth_users AS buyer ON sales.buyer_id = buyer.id
		JOIN public.auth_users AS seller ON sales.seller_id = seller.id
		WHERE sales.buyer_id = $1`
)

var (
	defQuery = `
    SELECT
      ads.id,
      ads.title,
      ads.name_appartment,
      ads.square,
      ads.num_rooms,
      ads.floor,
      ads.year_construction,
      ads.address,
      ads.price,
      ads.ceiling_height,
      ads.description,
      ads.created_at,
      ads.ads_type,
      ads.is_active,
      ads.stoped_at,
      ads.city,
      ads.district,

      -- поля автора
      u.id           AS author_id,
      u.login        AS author_login,
      u.name         AS author_name,
      u.created_at   AS author_created_at

    FROM public.ads
    JOIN public.auth_users u ON ads.author_id = u.id
    `
)
