CREATE TYPE commission_type AS ENUM (
    'PLACE_BET',
    'ACCOUNT_SIGNUP',
    'REDEEM_TICKET',
    'KENO_BET'
);

CREATE TABLE geo_transactions (
 id SERIAL PRIMARY KEY,
 server_create_time timestamp with time zone DEFAULT now() NOT NULL,
 client_create_time timestamp with time zone NOT NULL,
 account_id integer NOT NULL,
 type commission_type NOT NULL,
 transaction_id text,
 geo_venue_location geography(Point,4326),
 geo_uncertainty numeric,
 ticket_serial_number text,
 bet_transaction_number text,
 brand text
);