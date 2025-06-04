-- public.auth_users definition

-- Drop table

-- DROP TABLE public.auth_users;

CREATE TABLE public.auth_users (
	id serial4 NOT NULL,
	login text NOT NULL,
	pass text NOT NULL,
	"name" text NOT NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	subscribe bool DEFAULT false NOT NULL,
	stoped_at timestamptz NULL,
	balance numeric(12, 2) DEFAULT 0 NOT NULL,
	CONSTRAINT auth_users_login_key UNIQUE (login),
	CONSTRAINT auth_users_pkey PRIMARY KEY (id)
);


-- public.cities definition

-- Drop table

-- DROP TABLE public.cities;

CREATE TABLE public.cities (
	id serial4 NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT cities_name_key UNIQUE (name),
	CONSTRAINT cities_pkey PRIMARY KEY (id)
);


-- public.developers definition

-- Drop table

-- DROP TABLE public.developers;

CREATE TABLE public.developers (
	id serial4 NOT NULL,
	"name" text NOT NULL,
	description text NULL,
	phone text NULL,
	email text NULL,
	logo_url text NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	CONSTRAINT developers_pkey PRIMARY KEY (id)
);


-- public.ads definition

-- Drop table

-- DROP TABLE public.ads;

CREATE TABLE public.ads (
	id serial4 NOT NULL,
	title text NOT NULL,
	name_appartment text NOT NULL,
	square int4 NOT NULL,
	num_rooms int4 NOT NULL,
	floor int4 NOT NULL,
	year_construction int4 NOT NULL,
	address text NOT NULL,
	price int4 NOT NULL,
	ceiling_height int4 NOT NULL,
	description text NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	author_id int4 NOT NULL,
	ads_type int4 NOT NULL,
	is_active bool NOT NULL,
	stoped_at timestamptz NOT NULL,
	city text NOT NULL,
	district text NOT NULL,
	pledge bool NOT NULL,
	bank bool DEFAULT false NOT NULL,
	CONSTRAINT ads_pkey PRIMARY KEY (id),
	CONSTRAINT ads_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.auth_users(id)
);


-- public.ads_photos definition

-- Drop table

-- DROP TABLE public.ads_photos;

CREATE TABLE public.ads_photos (
	id serial4 NOT NULL,
	ads_id int4 NOT NULL,
	url text NOT NULL,
	main_url bool DEFAULT false NOT NULL,
	CONSTRAINT ads_photos_pkey PRIMARY KEY (id),
	CONSTRAINT ads_photos_ads_id_fkey FOREIGN KEY (ads_id) REFERENCES public.ads(id) ON DELETE CASCADE
);


-- public.developer_messages definition

-- Drop table

-- DROP TABLE public.developer_messages;

CREATE TABLE public.developer_messages (
	id serial4 NOT NULL,
	developer_id int4 NOT NULL,
	user_id int4 NOT NULL,
	message text NOT NULL,
	contact_info text NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	CONSTRAINT developer_messages_pkey PRIMARY KEY (id),
	CONSTRAINT developer_messages_developer_id_fkey FOREIGN KEY (developer_id) REFERENCES public.developers(id) ON DELETE CASCADE,
	CONSTRAINT developer_messages_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.auth_users(id) ON DELETE CASCADE
);


-- public.districts definition

-- Drop table

-- DROP TABLE public.districts;

CREATE TABLE public.districts (
	id serial4 NOT NULL,
	city_id int4 NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT districts_pkey PRIMARY KEY (id),
	CONSTRAINT districts_city_id_fkey FOREIGN KEY (city_id) REFERENCES public.cities(id)
);


-- public.messages definition

-- Drop table

-- DROP TABLE public.messages;

CREATE TABLE public.messages (
	id serial4 NOT NULL,
	sender_id int4 NOT NULL,
	receiver_id int4 NOT NULL,
	"content" text NOT NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	CONSTRAINT messages_pkey PRIMARY KEY (id),
	CONSTRAINT messages_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES public.auth_users(id),
	CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.auth_users(id)
);


-- public.sessions definition

-- Drop table

-- DROP TABLE public.sessions;

CREATE TABLE public.sessions (
	user_id int4 NOT NULL,
	"token" text NOT NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	CONSTRAINT sessions_pkey PRIMARY KEY (user_id),
	CONSTRAINT sessions_token_key UNIQUE (token),
	CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.auth_users(id) ON DELETE CASCADE
);


-- public.appartments definition

-- Drop table

-- DROP TABLE public.appartments;

CREATE TABLE public.appartments (
	id serial4 NOT NULL,
	"name" text NOT NULL,
	description text NULL,
	address text NULL,
	floors text NULL,
	"class" text NULL,
	parking text NULL,
	peculiarities text NULL,
	residents_value text NULL,
	"comments" text NULL,
	district_id int4 NULL,
	CONSTRAINT appartments_pkey PRIMARY KEY (id),
	CONSTRAINT appartments_district_id_fkey FOREIGN KEY (district_id) REFERENCES public.districts(id)
);

CREATE TABLE public.sales (
	id serial4 NOT NULL,
	id_ads int4 NOT NULL,
	buyer_id int4 NOT NULL,
	seller_id int4 NOT NULL,
	status_purchase bool DEFAULT false NOT NULL,
	purchase_amount numeric(12, 2) NOT NULL,
	confirmation_waiting_date timestamptz NULL,
	purchase_canceled bool DEFAULT false NOT NULL,
	price_with_service numeric(12, 2) NULL,
	CONSTRAINT sales_pkey PRIMARY KEY (id)
);
-- public.sales foreign keys

ALTER TABLE public.sales ADD CONSTRAINT sales_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES public.auth_users(id) ON DELETE RESTRICT;
ALTER TABLE public.sales ADD CONSTRAINT sales_id_ads_fkey FOREIGN KEY (id_ads) REFERENCES public.ads(id) ON DELETE RESTRICT;
ALTER TABLE public.sales ADD CONSTRAINT sales_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES public.auth_users(id) ON DELETE RESTRICT;


CREATE TABLE public."comments" (
	id serial4 NOT NULL,
	appartment_id int4 NOT NULL,
	user_id int4 NOT NULL,
	"comment" text NOT NULL,
	CONSTRAINT comments_pkey PRIMARY KEY (id)
);
-- public."comments" foreign keys

ALTER TABLE public."comments" ADD CONSTRAINT comments_appartment_id_fkey FOREIGN KEY (appartment_id) REFERENCES public.appartments(id) ON DELETE CASCADE;
ALTER TABLE public."comments" ADD CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.auth_users(id) ON DELETE CASCADE;



CREATE TABLE public."document" (
	id serial4 NOT NULL,
	id_ads int4 NOT NULL,
	url_doc varchar(1024) NOT NULL,
	CONSTRAINT document_pkey PRIMARY KEY (id)
);
-- public."document" foreign keys

ALTER TABLE public."document" ADD CONSTRAINT document_id_ads_fkey FOREIGN KEY (id_ads) REFERENCES public.ads(id) ON DELETE CASCADE;



CREATE TABLE public.banks (
	id serial4 NOT NULL,
	"name" varchar(255) NOT NULL,
	CONSTRAINT banks_pkey PRIMARY KEY (id)
);


-- public.type_ads definition

-- Drop table

-- DROP TABLE public.type_ads;

CREATE TABLE public.type_ads (
	id serial4 NOT NULL,
	title_name varchar(255) NOT NULL,
	CONSTRAINT type_ads_pkey PRIMARY KEY (id)
);